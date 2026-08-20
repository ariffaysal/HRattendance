import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { UserRoleValue } from '../decorators/roles.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsIn(['employee', 'hr', 'admin'])
  role?: UserRoleValue;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
