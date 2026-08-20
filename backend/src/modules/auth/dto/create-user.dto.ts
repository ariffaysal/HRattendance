import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsIn } from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/is-strong-password.validator';
import { UserRoleValue } from '../decorators/roles.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  employeeId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @IsStrongPassword()
  password: string;

  @IsIn(['employee', 'hr', 'admin'])
  @IsNotEmpty()
  role: UserRoleValue;
}
