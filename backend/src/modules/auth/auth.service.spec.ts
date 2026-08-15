import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';
import { SQL_CONNECTION } from '../../database/database.module';

describe('AuthService', () => {
  let authService: AuthService;
  let db: { execute: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  const BCRYPT_ROUNDS = 4; // low rounds keep tests fast

  beforeEach(async () => {
    db = { execute: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-jwt-token') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SQL_CONNECTION, useValue: db },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('returns a JWT and user details for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-password', BCRYPT_ROUNDS);
      const user = {
        id: 1,
        employee_id: 'EMP001',
        email: 'emp@example.com',
        mobile_number: '1234567890',
        password_hash: passwordHash,
        is_active: 1,
      };
      db.execute
        .mockResolvedValueOnce([[user], { rowCount: 1 }]) // SELECT user
        .mockResolvedValueOnce([[], { rowCount: 1 }]); // UPDATE last_login

      const result = await authService.login({ employeeId: 'EMP001', password: 'correct-password' });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user).toEqual({
        id: 1,
        employeeId: 'EMP001',
        email: 'emp@example.com',
        mobileNumber: '1234567890',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, employeeId: 'EMP001' }),
      );
    });

    it('rejects an unknown employee ID', async () => {
      db.execute.mockResolvedValueOnce([[], { rowCount: 0 }]);
      await expect(
        authService.login({ employeeId: 'NOPE', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an inactive account', async () => {
      const passwordHash = await bcrypt.hash('correct-password', BCRYPT_ROUNDS);
      const user = {
        id: 1,
        employee_id: 'EMP001',
        email: 'emp@example.com',
        mobile_number: '1234567890',
        password_hash: passwordHash,
        is_active: 0,
      };
      db.execute.mockResolvedValueOnce([[user], { rowCount: 1 }]);
      await expect(
        authService.login({ employeeId: 'EMP001', password: 'correct-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', BCRYPT_ROUNDS);
      const user = {
        id: 1,
        employee_id: 'EMP001',
        email: 'emp@example.com',
        mobile_number: '1234567890',
        password_hash: passwordHash,
        is_active: 1,
      };
      db.execute.mockResolvedValueOnce([[user], { rowCount: 1 }]);
      await expect(
        authService.login({ employeeId: 'EMP001', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('upgrades a legacy SHA-256 hash to bcrypt on successful login', async () => {
      const legacyHash = crypto.createHash('sha256').update('old-password').digest('hex');
      const user = {
        id: 7,
        employee_id: 'EMP007',
        email: 'legacy@example.com',
        mobile_number: '1234567890',
        password_hash: legacyHash,
        is_active: 1,
      };
      db.execute
        .mockResolvedValueOnce([[user], { rowCount: 1 }]) // SELECT user
        .mockResolvedValueOnce([[], { rowCount: 1 }]); // UPDATE password_hash -> bcrypt

      const result = await authService.login({ employeeId: 'EMP007', password: 'old-password' });

      expect(result.success).toBe(true);
      const updateCall = db.execute.mock.calls.find(([sql]) => sql.includes('UPDATE auth_users SET password_hash'));
      expect(updateCall).toBeDefined();
      const upgradedHash = updateCall[1][0] as string;
      expect(upgradedHash.startsWith('$2')).toBe(true); // bcrypt, not SHA-256
      expect(upgradedHash).not.toBe(legacyHash);
      await expect(bcrypt.compare('old-password', upgradedHash)).resolves.toBe(true);
    });
  });

  describe('register', () => {
    it('rejects a duplicate employee ID', async () => {
      db.execute
        .mockResolvedValueOnce([[{ id: 1 }], { rowCount: 1 }]) // existing employee_id
        .mockResolvedValueOnce([[], { rowCount: 0 }]);
      await expect(
        authService.register({
          employeeId: 'EMP001',
          email: 'new@example.com',
          mobileNumber: '1234567890',
          password: 'StrongPass1!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects a duplicate email', async () => {
      db.execute
        .mockResolvedValueOnce([[], { rowCount: 0 }]) // employee_id free
        .mockResolvedValueOnce([[{ id: 2 }], { rowCount: 1 }]); // email taken
      await expect(
        authService.register({
          employeeId: 'EMP001',
          email: 'taken@example.com',
          mobileNumber: '1234567890',
          password: 'StrongPass1!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('stores a bcrypt hash (never plaintext or SHA-256)', async () => {
      db.execute
        .mockResolvedValueOnce([[], { rowCount: 0 }]) // employee_id free
        .mockResolvedValueOnce([[], { rowCount: 0 }]) // email free
        .mockResolvedValueOnce([[], { rowCount: 1 }]); // INSERT

      const result = await authService.register({
        employeeId: 'EMP003',
        email: 'new@example.com',
        mobileNumber: '1234567890',
        password: 'StrongPass1!',
      });

      expect(result.success).toBe(true);
      const insertCall = db.execute.mock.calls.find(([sql]) => sql.includes('INSERT INTO auth_users'));
      expect(insertCall).toBeDefined();
      const [employeeId, , , storedHash] = insertCall[1];
      expect(employeeId).toBe('EMP003');
      expect(storedHash.startsWith('$2')).toBe(true);
      expect(storedHash).not.toContain('StrongPass1!');
      await expect(bcrypt.compare('StrongPass1!', storedHash)).resolves.toBe(true);
    });
  });

  describe('validateUser', () => {
    it('returns the user for an active account', async () => {
      const user = {
        id: 1,
        employee_id: 'EMP001',
        email: 'emp@example.com',
        mobile_number: '1234567890',
        is_active: 1,
      };
      db.execute.mockResolvedValueOnce([[user], { rowCount: 1 }]);
      await expect(authService.validateUser('EMP001')).resolves.toEqual({
        id: 1,
        employeeId: 'EMP001',
        email: 'emp@example.com',
        mobileNumber: '1234567890',
      });
    });

    it('returns null for an unknown or inactive account', async () => {
      db.execute.mockResolvedValueOnce([[], { rowCount: 0 }]);
      await expect(authService.validateUser('GHOST')).resolves.toBeNull();

      db.execute.mockResolvedValueOnce([[{ ...{ is_active: 0 } }], { rowCount: 1 }]);
      await expect(authService.validateUser('EMP001')).resolves.toBeNull();
    });
  });
});
