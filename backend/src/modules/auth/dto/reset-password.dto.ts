import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/is-strong-password.validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @IsStrongPassword()
  newPassword: string;
}
