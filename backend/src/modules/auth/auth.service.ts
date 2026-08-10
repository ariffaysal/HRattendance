import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PgConnection, SQL_CONNECTION } from '../../database/database.module';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SQL_CONNECTION)
    private connection: PgConnection,
    private readonly jwtService: JwtService,
  ) {}

  // Legacy SHA-256 hashing used before the bcrypt migration - kept only to
  // verify old accounts and upgrade them to bcrypt on their next login.
  private legacyHashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(registerDto: RegisterDto) {
    const { employeeId, email, mobileNumber, password } = registerDto;

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
      'INSERT INTO auth_users (employee_id, email, mobile_number, password_hash) VALUES ($1, $2, $3, $4)',
      [employeeId, email, mobileNumber, passwordHash],
    );

    return {
      success: true,
      message: 'Account created successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { employeeId, password } = loginDto;

    // Find user by employee_id
    const [users] = await this.connection.execute(
      'SELECT id, employee_id, email, mobile_number, password_hash, is_active FROM auth_users WHERE employee_id = $1',
      [employeeId],
    );

    const user = (users as any[])[0];

    if (!user) {
      throw new UnauthorizedException('Invalid employee ID or password');
    }

    if (!user.is_active) {
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
        throw new UnauthorizedException('Invalid employee ID or password');
      }
    }

    // Update last login
    await this.connection.execute(
      'UPDATE auth_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id],
    );

    // Sign a JWT access token
    const payload = { sub: user.id, employeeId: user.employee_id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        mobileNumber: user.mobile_number,
      },
    };
  }

  async validateUser(employeeId: string) {
    const [users] = await this.connection.execute(
      'SELECT id, employee_id, email, mobile_number, is_active FROM auth_users WHERE employee_id = $1',
      [employeeId],
    );

    const user = (users as any[])[0];

    if (!user || !user.is_active) {
      return null;
    }

    return {
      id: user.id,
      employeeId: user.employee_id,
      email: user.email,
      mobileNumber: user.mobile_number,
    };
  }
}
