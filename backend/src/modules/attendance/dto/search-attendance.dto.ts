import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchAttendanceDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || '')
  search?: string;

  @IsOptional()
  @IsIn(['general', 'emp_no', 'acc_no'])
  searchType?: 'general' | 'emp_no' | 'acc_no' = 'general';

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsIn(['landing', 'job_card', 'monthly', 'users'])
  view?: string = 'landing';
}
