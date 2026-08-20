import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PgConnection, SQL_CONNECTION } from '../../database/database.module';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

// Columns safe to return to clients - never expose password_hash.
const USER_SELECT = 'id, employee_id, email, mobile_number, role, is_active, last_login, created_at';

export interface JwtUser {
  sub: number;
  employeeId: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(SQL_CONNECTION)
    private connection: PgConnection,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  // Legacy SHA-256 hashing used before the bcrypt migration - kept only to
  // verify old accounts and upgrade them to bcrypt on their next login.
  private legacyHashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Admin-only: create an employee / HR / admin account.
   * There is deliberately NO public self-registration - only admins can
   * provision accounts.
   */
  async createUser(createUserDto: CreateUserDto, actor?: JwtUser) {
    const { employeeId, email, mobileNumber, password, role } = createUserDto;

    // Check if employee_id already exists
    const [existingEmployee] = await this.connection.execute(
      'SELECT id FROM auth_users WHERE employee_id = $1',
      [employeeId],
    );

    if ((existingEmployee as any[]).length > 0) {
      throw new ConflictException('Employee ID already registered');
    }

    // Check if email already exists
    const [existingEmail] = await this.connection.execute(
      'SELECT id FROM auth_users WHERE email = $1',
      [email],
    );

    if ((existingEmail as any[]).length > 0) {
      throw new ConflictException('Email already registered');
    }

    // Hash password with bcrypt (salted, slow - safe against rainbow tables)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    await this.connection.execute(
      'INSERT INTO auth_users (employee_id, email, mobile_number, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [employeeId, email, mobileNumber, passwordHash, role],
    );

    await this.auditService.log({
      action: 'create_user',
      entity: 'auth',
      entityId: employeeId,
      actorId: actor?.sub ?? null,
      actorEmployeeId: actor?.employeeId ?? null,
      details: { email, role },
    });

    return {
      success: true,
      message: `Account created successfully with role "${role}"`,
    };
  }

  /** Admin-only: list all accounts (no password hashes). */
  async getUsers() {
    const [users] = await this.connection.execute(
      `SELECT ${USER_SELECT} FROM auth_users ORDER BY id`,
    );
    return users.map((u: any) => ({
      id: u.id,
      employeeId: u.employee_id,
      email: u.email,
      mobileNumber: u.mobile_number,
      role: u.role,
      isActive: u.is_active === 1 || u.is_active === true,
      lastLogin: u.last_login,
      createdAt: u.created_at,
    }));
  }

  /** Admin-only: change an account's role or active status. */
  async updateUser(id: number, updateUserDto: UpdateUserDto, actor?: JwtUser) {
    const [users] = await this.connection.execute(
      `SELECT ${USER_SELECT} FROM auth_users WHERE id = $1`,
      [id],
    );
    const user = (users as any[])[0];

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { role, isActive } = updateUserDto;

    // Never allow the system to end up with zero admins.
    if ((role && role !== user.role) || (isActive === false && user.is_active === 1)) {
      if (user.role === 'admin') {
        const [admins] = await this.connection.execute(
          `SELECT ${USER_SELECT} FROM auth_users WHERE role = 'admin' AND is_active = 1`,
        );
        const activeAdmins = (admins as any[]).filter(
          (a) => a.is_active === 1 || a.is_active === true,
        );
        if (activeAdmins.length <= 1) {
          throw new ForbiddenException(
            'Cannot demote or deactivate the last active admin account',
          );
        }
      }
    }

    const sets: string[] = [];
    const values: any[] = [];
    if (role) {
      values.push(role);
      sets.push(`role = $${values.length}`);
    }
    if (isActive !== undefined) {
      values.push(isActive ? 1 : 0);
      sets.push(`is_active = $${values.length}`);
    }

    if (sets.length === 0) {
      return { success: true, message: 'No changes provided' };
    }

    values.push(id);
    await this.connection.execute(
      `UPDATE auth_users SET ${sets.join(', ')} WHERE id = $${values.length}`,
      values,
    );

    await this.auditService.log({
      action: 'update_user',
      entity: 'auth',
      entityId: user.employee_id,
      actorId: actor?.sub ?? null,
      actorEmployeeId: actor?.employeeId ?? null,
      details: { role, isActive },
    });

    return { success: true, message: 'Account updated successfully' };
  }

  /** Admin-only: reset an account's password. */
  async resetPassword(id: number, resetPasswordDto: ResetPasswordDto, actor?: JwtUser) {
    const [users] = await this.connection.execute(
      `SELECT ${USER_SELECT} FROM auth_users WHERE id = $1`,
      [id],
    );
    const user = (users as any[])[0];

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.connection.execute(
      'UPDATE auth_users SET password_hash = $1 WHERE id = $2',
      [passwordHash, id],
    );

    await this.auditService.log({
      action: 'reset_password',
      entity: 'auth',
      entityId: user.employee_id,
      actorId: actor?.sub ?? null,
      actorEmployeeId: actor?.employeeId ?? null,
      details: {},
    });

    return { success: true, message: 'Password reset successfully' };
  }

  async login(loginDto: LoginDto) {
    const { employeeId, password } = loginDto;

    // Find user by employee_id
    const [users] = await this.connection.execute(
      `SELECT ${USER_SELECT}, password_hash FROM auth_users WHERE employee_id = $1`,
      [employeeId],
    );

    const user = (users as any[])[0];

    if (!user) {
      await this.auditService.log({
        action: 'login_failed',
        entity: 'auth',
        entityId: employeeId,
        details: { reason: 'unknown_employee' },
      });
      throw new UnauthorizedException('Invalid employee ID or password');
    }

    if (user.is_active !== 1 && user.is_active !== true) {
      await this.auditService.log({
        action: 'login_failed',
        entity: 'auth',
        entityId: employeeId,
        details: { reason: 'inactive_account' },
      });
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      // Backwards compatibility: old accounts were stored as unsalted SHA-256.
      // If the legacy hash matches, upgrade the account to bcrypt on the spot.
      if (user.password_hash === this.legacyHashPassword(password)) {
        const upgradedHash = await bcrypt.hash(password, 10);
        await this.connection.execute(
          'UPDATE auth_users SET password_hash = $1 WHERE id = $2',
          [upgradedHash, user.id],
        );
      } else {
        await this.auditService.log({
          action: 'login_failed',
          entity: 'auth',
          entityId: employeeId,
          details: { reason: 'wrong_password' },
        });
        throw new UnauthorizedException('Invalid employee ID or password');
      }
    }

    // Update last login
    await this.connection.execute(
      'UPDATE auth_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id],
    );

    // Sign a JWT access token carrying the role for authorization decisions
    const payload: JwtUser = { sub: user.id, employeeId: user.employee_id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    await this.auditService.log({
      action: 'login',
      entity: 'auth',
      entityId: user.employee_id,
      actorId: user.id,
      actorEmployeeId: user.employee_id,
    });

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        mobileNumber: user.mobile_number,
        role: user.role,
      },
    };
  }

  async validateUser(employeeId: string) {
    const [users] = await this.connection.execute(
      `SELECT ${USER_SELECT} FROM auth_users WHERE employee_id = $1`,
      [employeeId],
    );

    const user = (users as any[])[0];

    if (!user || (user.is_active !== 1 && user.is_active !== true)) {
      return null;
    }

    return {
      id: user.id,
      employeeId: user.employee_id,
      email: user.email,
      mobileNumber: user.mobile_number,
      role: user.role,
    };
  }

  /**
   * Returns the user for the JWT's subject id, or 401 if the account no
   * longer exists or was deactivated. The frontend calls this on app load to
   * validate stored sessions and drop stale cookies/tokens (e.g. after a
   * database reset or an account deletion).
   */
  async getMe(userId: number) {
    const [users] = await this.connection.execute(
      `SELECT ${USER_SELECT} FROM auth_users WHERE id = $1`,
      [userId],
    );

    const user = (users as any[])[0];

    if (!user || (user.is_active !== 1 && user.is_active !== true)) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    return {
      success: true,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        mobileNumber: user.mobile_number,
        role: user.role,
      },
    };
  }
}
