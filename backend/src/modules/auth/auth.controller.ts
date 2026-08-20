import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, JwtUser } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * The ONLY public authentication endpoint.
   * There is no self-registration - accounts are created by an admin.
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Validates the caller's session and returns their fresh account data.
   * The frontend calls this on load to drop stale sessions whose account was
   * deleted/deactivated or whose database was reset.
   */
  @Get('me')
  async getMe(@Req() request: any) {
    return this.authService.getMe((request.user as JwtUser).sub);
  }

  /** Admin-only: create an employee / HR / admin account. */
  @Roles('admin')
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto, @Req() request: any) {
    return this.authService.createUser(createUserDto, request.user as JwtUser);
  }

  /** Admin-only: list all accounts. */
  @Roles('admin')
  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  /** Admin-only: change role / active status of an account. */
  @Roles('admin')
  @Patch('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: any,
  ) {
    return this.authService.updateUser(id, updateUserDto, request.user as JwtUser);
  }

  /** Admin-only: reset an account's password. */
  @Roles('admin')
  @Post('users/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() request: any,
  ) {
    return this.authService.resetPassword(id, resetPasswordDto, request.user as JwtUser);
  }
}
