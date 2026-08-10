import { IsString, IsOptional } from 'class-validator';

export class CreateEmployeeEducationDto {
  // Top Section - Employee Information
  @IsString()
  empCode: string;

  @IsString()
  @IsOptional()
  empId?: string;

  @IsString()
  @IsOptional()
  empName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  division?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  subsection?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  // Middle Section - Education Details
  @IsString()
  @IsOptional()
  courseName?: string;

  @IsString()
  @IsOptional()
  board?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsString()
  @IsOptional()
  discipline?: string;

  @IsString()
  @IsOptional()
  majorSubject?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsString()
  @IsOptional()
  educationNature?: string;
}

export class UpdateEmployeeEducationDto extends CreateEmployeeEducationDto {}
