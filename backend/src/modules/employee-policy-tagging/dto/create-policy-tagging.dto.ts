import { IsString, IsOptional } from 'class-validator';

export class CreatePolicyTaggingDto {
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

  // Policy fields
  @IsString()
  @IsOptional()
  overtimePolicyRule?: string;

  @IsString()
  @IsOptional()
  overtimePolicyDate?: string;

  @IsString()
  @IsOptional()
  holidayIncentiveRule?: string;

  @IsString()
  @IsOptional()
  holidayIncentiveDate?: string;

  @IsString()
  @IsOptional()
  dutyRosterPolicyRule?: string;

  @IsString()
  @IsOptional()
  dutyRosterPolicyDate?: string;

  @IsString()
  @IsOptional()
  leavePolicyRule?: string;

  @IsString()
  @IsOptional()
  leavePolicyDate?: string;

  @IsString()
  @IsOptional()
  maternityLeavePolicyRule?: string;

  @IsString()
  @IsOptional()
  maternityLeavePolicyDate?: string;

  @IsString()
  @IsOptional()
  attendanceBonusPolicyRule?: string;

  @IsString()
  @IsOptional()
  attendanceBonusPolicyDate?: string;

  @IsString()
  @IsOptional()
  absentDeductionPolicyRule?: string;

  @IsString()
  @IsOptional()
  absentDeductionPolicyDate?: string;

  @IsString()
  @IsOptional()
  lateDeductionPolicyRule?: string;

  @IsString()
  @IsOptional()
  lateDeductionPolicyDate?: string;

  @IsString()
  @IsOptional()
  bonusPolicyRule?: string;

  @IsString()
  @IsOptional()
  bonusPolicyDate?: string;

  @IsString()
  @IsOptional()
  taxPolicyRule?: string;

  @IsString()
  @IsOptional()
  taxPolicyDate?: string;

  @IsString()
  @IsOptional()
  shiftPolicyRule?: string;

  @IsString()
  @IsOptional()
  shiftPolicyDate?: string;

  @IsString()
  @IsOptional()
  tiffinBillPolicyRule?: string;

  @IsString()
  @IsOptional()
  tiffinBillPolicyDate?: string;

  @IsString()
  @IsOptional()
  allowancePolicyRule?: string;

  @IsString()
  @IsOptional()
  allowancePolicyDate?: string;

  @IsString()
  @IsOptional()
  earlyOutDeductionPolicyRule?: string;

  @IsString()
  @IsOptional()
  earlyOutDeductionPolicyDate?: string;

  @IsString()
  @IsOptional()
  serviceBenefitPolicyRule?: string;

  @IsString()
  @IsOptional()
  serviceBenefitPolicyDate?: string;

  @IsString()
  @IsOptional()
  hdDeductRuleRule?: string;

  @IsString()
  @IsOptional()
  hdDeductRuleDate?: string;
}

export class UpdatePolicyTaggingDto extends CreatePolicyTaggingDto {}
