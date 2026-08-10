import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BankInfoDto {
  @IsString()
  @IsOptional()
  salaryBank?: string;

  @IsString()
  @IsOptional()
  branchName?: string;

  @IsString()
  @IsOptional()
  accountNo?: string;

  @IsString()
  @IsOptional()
  salaryAmount?: string;

  @IsString()
  @IsOptional()
  salaryPeriod?: string;

  @IsString()
  @IsOptional()
  showTax?: string;

  @IsString()
  @IsOptional()
  sequence?: string;
}

export class SalaryBreakdownDto {
  @IsString()
  @IsOptional()
  payrollHead?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  percentageFormula?: string;

  @IsString()
  @IsOptional()
  baseHead?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  sequence?: string;
}

export class CreateEmployeeSalaryInformationDto {
  // Employee Details
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

  // Salary Information
  @IsString()
  @IsOptional()
  sGrade?: string;

  @IsString()
  @IsOptional()
  stSalary?: string;

  @IsString()
  @IsOptional()
  grossSalary?: string;

  @IsString()
  @IsOptional()
  bGross?: string;

  @IsString()
  @IsOptional()
  cashDisbursement?: string;

  @IsString()
  @IsOptional()
  policy?: string;

  @IsString()
  @IsOptional()
  mode?: string;

  // Bank Information
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankInfoDto)
  @IsOptional()
  bankInfos?: BankInfoDto[];

  // Salary Breakdown
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryBreakdownDto)
  @IsOptional()
  salaryBreakdown?: SalaryBreakdownDto[];
}

export class UpdateEmployeeSalaryInformationDto extends CreateEmployeeSalaryInformationDto {}
