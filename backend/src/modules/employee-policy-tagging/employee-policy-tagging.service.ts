import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PgConnection, SQL_CONNECTION } from '../../database/database.module';
import { CreatePolicyTaggingDto, UpdatePolicyTaggingDto } from './dto/create-policy-tagging.dto';

@Injectable()
export class EmployeePolicyTaggingService {
  constructor(
    @Inject(SQL_CONNECTION) private connection: PgConnection,
  ) {}

  // Transform snake_case DB results to camelCase for API
  private transformToCamelCase(row: any): any {
    if (!row) return null;
    return {
      id: row.id,
      empCode: row.emp_code,
      empId: row.emp_id,
      empName: row.emp_name,
      category: row.category,
      company: row.company,
      location: row.location,
      division: row.division,
      department: row.department,
      section: row.section,
      subsection: row.subsection,
      designation: row.designation,
      // Policies
      overtimePolicyRule: row.overtime_policy_rule,
      overtimePolicyDate: row.overtime_policy_date,
      holidayIncentiveRule: row.holiday_incentive_rule,
      holidayIncentiveDate: row.holiday_incentive_date,
      dutyRosterPolicyRule: row.duty_roster_policy_rule,
      dutyRosterPolicyDate: row.duty_roster_policy_date,
      leavePolicyRule: row.leave_policy_rule,
      leavePolicyDate: row.leave_policy_date,
      maternityLeavePolicyRule: row.maternity_leave_policy_rule,
      maternityLeavePolicyDate: row.maternity_leave_policy_date,
      attendanceBonusPolicyRule: row.attendance_bonus_policy_rule,
      attendanceBonusPolicyDate: row.attendance_bonus_policy_date,
      absentDeductionPolicyRule: row.absent_deduction_policy_rule,
      absentDeductionPolicyDate: row.absent_deduction_policy_date,
      lateDeductionPolicyRule: row.late_deduction_policy_rule,
      lateDeductionPolicyDate: row.late_deduction_policy_date,
      bonusPolicyRule: row.bonus_policy_rule,
      bonusPolicyDate: row.bonus_policy_date,
      taxPolicyRule: row.tax_policy_rule,
      taxPolicyDate: row.tax_policy_date,
      shiftPolicyRule: row.shift_policy_rule,
      shiftPolicyDate: row.shift_policy_date,
      tiffinBillPolicyRule: row.tiffin_bill_policy_rule,
      tiffinBillPolicyDate: row.tiffin_bill_policy_date,
      allowancePolicyRule: row.allowance_policy_rule,
      allowancePolicyDate: row.allowance_policy_date,
      earlyOutDeductionPolicyRule: row.early_out_deduction_policy_rule,
      earlyOutDeductionPolicyDate: row.early_out_deduction_policy_date,
      serviceBenefitPolicyRule: row.service_benefit_policy_rule,
      serviceBenefitPolicyDate: row.service_benefit_policy_date,
      hdDeductRuleRule: row.hd_deduct_rule_rule,
      hdDeductRuleDate: row.hd_deduct_rule_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(search?: string): Promise<any[]> {
    let query = 'SELECT * FROM employee_policy_tagging';
    const params: any[] = [];

    if (search) {
      query += ' WHERE emp_code LIKE $1 OR emp_name LIKE $2 OR emp_id LIKE $3';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await this.connection.execute(query, params);
    return (rows as any[]).map(row => this.transformToCamelCase(row));
  }

  async findOne(id: number): Promise<any> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_policy_tagging WHERE id = $1',
      [id],
    );

    const records = rows as any[];
    if (records.length === 0) {
      throw new NotFoundException('Employee policy tagging not found');
    }
    return this.transformToCamelCase(records[0]);
  }

  async findByEmpCode(empCode: string): Promise<any | null> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_policy_tagging WHERE emp_code = $1',
      [empCode],
    );

    const records = rows as any[];
    return records.length > 0 ? this.transformToCamelCase(records[0]) : null;
  }

  async create(dto: CreatePolicyTaggingDto): Promise<any> {
    // Check for duplicate emp_code
    const existing = await this.findByEmpCode(dto.empCode);
    if (existing) {
      throw new BadRequestException('Employee code already has policy tagging');
    }

    const sql = `
      INSERT INTO employee_policy_tagging (
        emp_code, emp_id, emp_name, category, company, location, division, department, section, subsection, designation,
        overtime_policy_rule, overtime_policy_date,
        holiday_incentive_rule, holiday_incentive_date,
        duty_roster_policy_rule, duty_roster_policy_date,
        leave_policy_rule, leave_policy_date,
        maternity_leave_policy_rule, maternity_leave_policy_date,
        attendance_bonus_policy_rule, attendance_bonus_policy_date,
        absent_deduction_policy_rule, absent_deduction_policy_date,
        late_deduction_policy_rule, late_deduction_policy_date,
        bonus_policy_rule, bonus_policy_date,
        tax_policy_rule, tax_policy_date,
        shift_policy_rule, shift_policy_date,
        tiffin_bill_policy_rule, tiffin_bill_policy_date,
        allowance_policy_rule, allowance_policy_date,
        early_out_deduction_policy_rule, early_out_deduction_policy_date,
        service_benefit_policy_rule, service_benefit_policy_date,
        hd_deduct_rule_rule, hd_deduct_rule_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43)
      RETURNING id
    `;

    const values = [
      dto.empCode,
      dto.empId || null,
      dto.empName || null,
      dto.category || null,
      dto.company || null,
      dto.location || null,
      dto.division || null,
      dto.department || null,
      dto.section || null,
      dto.subsection || null,
      dto.designation || null,
      dto.overtimePolicyRule || null,
      dto.overtimePolicyDate || null,
      dto.holidayIncentiveRule || null,
      dto.holidayIncentiveDate || null,
      dto.dutyRosterPolicyRule || null,
      dto.dutyRosterPolicyDate || null,
      dto.leavePolicyRule || null,
      dto.leavePolicyDate || null,
      dto.maternityLeavePolicyRule || null,
      dto.maternityLeavePolicyDate || null,
      dto.attendanceBonusPolicyRule || null,
      dto.attendanceBonusPolicyDate || null,
      dto.absentDeductionPolicyRule || null,
      dto.absentDeductionPolicyDate || null,
      dto.lateDeductionPolicyRule || null,
      dto.lateDeductionPolicyDate || null,
      dto.bonusPolicyRule || null,
      dto.bonusPolicyDate || null,
      dto.taxPolicyRule || null,
      dto.taxPolicyDate || null,
      dto.shiftPolicyRule || null,
      dto.shiftPolicyDate || null,
      dto.tiffinBillPolicyRule || null,
      dto.tiffinBillPolicyDate || null,
      dto.allowancePolicyRule || null,
      dto.allowancePolicyDate || null,
      dto.earlyOutDeductionPolicyRule || null,
      dto.earlyOutDeductionPolicyDate || null,
      dto.serviceBenefitPolicyRule || null,
      dto.serviceBenefitPolicyDate || null,
      dto.hdDeductRuleRule || null,
      dto.hdDeductRuleDate || null,
    ];

    const [rows] = await this.connection.execute(sql, values);
    const insertId = (rows as any[])[0].id;
    return this.findOne(insertId);
  }

  async update(id: number, dto: UpdatePolicyTaggingDto): Promise<any> {
    await this.findOne(id);

    // Get raw row for update
    const [existingRows] = await this.connection.execute(
      'SELECT * FROM employee_policy_tagging WHERE id = $1',
      [id],
    );
    const rawExisting = (existingRows as any[])[0];

    // Check if emp_code is being changed and if new code already exists
    if (dto.empCode && dto.empCode !== rawExisting.emp_code) {
      const duplicate = await this.findByEmpCode(dto.empCode);
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException('Employee code already has policy tagging');
      }
    }

    const sql = `
      UPDATE employee_policy_tagging SET
        emp_code = $1,
        emp_id = $2,
        emp_name = $3,
        category = $4,
        company = $5,
        location = $6,
        division = $7,
        department = $8,
        section = $9,
        subsection = $10,
        designation = $11,
        overtime_policy_rule = $12,
        overtime_policy_date = $13,
        holiday_incentive_rule = $14,
        holiday_incentive_date = $15,
        duty_roster_policy_rule = $16,
        duty_roster_policy_date = $17,
        leave_policy_rule = $18,
        leave_policy_date = $19,
        maternity_leave_policy_rule = $20,
        maternity_leave_policy_date = $21,
        attendance_bonus_policy_rule = $22,
        attendance_bonus_policy_date = $23,
        absent_deduction_policy_rule = $24,
        absent_deduction_policy_date = $25,
        late_deduction_policy_rule = $26,
        late_deduction_policy_date = $27,
        bonus_policy_rule = $28,
        bonus_policy_date = $29,
        tax_policy_rule = $30,
        tax_policy_date = $31,
        shift_policy_rule = $32,
        shift_policy_date = $33,
        tiffin_bill_policy_rule = $34,
        tiffin_bill_policy_date = $35,
        allowance_policy_rule = $36,
        allowance_policy_date = $37,
        early_out_deduction_policy_rule = $38,
        early_out_deduction_policy_date = $39,
        service_benefit_policy_rule = $40,
        service_benefit_policy_date = $41,
        hd_deduct_rule_rule = $42,
        hd_deduct_rule_date = $43
      WHERE id = $44
    `;

    const values = [
      dto.empCode || rawExisting.emp_code,
      dto.empId !== undefined ? dto.empId : rawExisting.emp_id,
      dto.empName !== undefined ? dto.empName : rawExisting.emp_name,
      dto.category !== undefined ? dto.category : rawExisting.category,
      dto.company !== undefined ? dto.company : rawExisting.company,
      dto.location !== undefined ? dto.location : rawExisting.location,
      dto.division !== undefined ? dto.division : rawExisting.division,
      dto.department !== undefined ? dto.department : rawExisting.department,
      dto.section !== undefined ? dto.section : rawExisting.section,
      dto.subsection !== undefined ? dto.subsection : rawExisting.subsection,
      dto.designation !== undefined ? dto.designation : rawExisting.designation,
      dto.overtimePolicyRule !== undefined ? dto.overtimePolicyRule : rawExisting.overtime_policy_rule,
      dto.overtimePolicyDate !== undefined ? dto.overtimePolicyDate : rawExisting.overtime_policy_date,
      dto.holidayIncentiveRule !== undefined ? dto.holidayIncentiveRule : rawExisting.holiday_incentive_rule,
      dto.holidayIncentiveDate !== undefined ? dto.holidayIncentiveDate : rawExisting.holiday_incentive_date,
      dto.dutyRosterPolicyRule !== undefined ? dto.dutyRosterPolicyRule : rawExisting.duty_roster_policy_rule,
      dto.dutyRosterPolicyDate !== undefined ? dto.dutyRosterPolicyDate : rawExisting.duty_roster_policy_date,
      dto.leavePolicyRule !== undefined ? dto.leavePolicyRule : rawExisting.leave_policy_rule,
      dto.leavePolicyDate !== undefined ? dto.leavePolicyDate : rawExisting.leave_policy_date,
      dto.maternityLeavePolicyRule !== undefined ? dto.maternityLeavePolicyRule : rawExisting.maternity_leave_policy_rule,
      dto.maternityLeavePolicyDate !== undefined ? dto.maternityLeavePolicyDate : rawExisting.maternity_leave_policy_date,
      dto.attendanceBonusPolicyRule !== undefined ? dto.attendanceBonusPolicyRule : rawExisting.attendance_bonus_policy_rule,
      dto.attendanceBonusPolicyDate !== undefined ? dto.attendanceBonusPolicyDate : rawExisting.attendance_bonus_policy_date,
      dto.absentDeductionPolicyRule !== undefined ? dto.absentDeductionPolicyRule : rawExisting.absent_deduction_policy_rule,
      dto.absentDeductionPolicyDate !== undefined ? dto.absentDeductionPolicyDate : rawExisting.absent_deduction_policy_date,
      dto.lateDeductionPolicyRule !== undefined ? dto.lateDeductionPolicyRule : rawExisting.late_deduction_policy_rule,
      dto.lateDeductionPolicyDate !== undefined ? dto.lateDeductionPolicyDate : rawExisting.late_deduction_policy_date,
      dto.bonusPolicyRule !== undefined ? dto.bonusPolicyRule : rawExisting.bonus_policy_rule,
      dto.bonusPolicyDate !== undefined ? dto.bonusPolicyDate : rawExisting.bonus_policy_date,
      dto.taxPolicyRule !== undefined ? dto.taxPolicyRule : rawExisting.tax_policy_rule,
      dto.taxPolicyDate !== undefined ? dto.taxPolicyDate : rawExisting.tax_policy_date,
      dto.shiftPolicyRule !== undefined ? dto.shiftPolicyRule : rawExisting.shift_policy_rule,
      dto.shiftPolicyDate !== undefined ? dto.shiftPolicyDate : rawExisting.shift_policy_date,
      dto.tiffinBillPolicyRule !== undefined ? dto.tiffinBillPolicyRule : rawExisting.tiffin_bill_policy_rule,
      dto.tiffinBillPolicyDate !== undefined ? dto.tiffinBillPolicyDate : rawExisting.tiffin_bill_policy_date,
      dto.allowancePolicyRule !== undefined ? dto.allowancePolicyRule : rawExisting.allowance_policy_rule,
      dto.allowancePolicyDate !== undefined ? dto.allowancePolicyDate : rawExisting.allowance_policy_date,
      dto.earlyOutDeductionPolicyRule !== undefined ? dto.earlyOutDeductionPolicyRule : rawExisting.early_out_deduction_policy_rule,
      dto.earlyOutDeductionPolicyDate !== undefined ? dto.earlyOutDeductionPolicyDate : rawExisting.early_out_deduction_policy_date,
      dto.serviceBenefitPolicyRule !== undefined ? dto.serviceBenefitPolicyRule : rawExisting.service_benefit_policy_rule,
      dto.serviceBenefitPolicyDate !== undefined ? dto.serviceBenefitPolicyDate : rawExisting.service_benefit_policy_date,
      dto.hdDeductRuleRule !== undefined ? dto.hdDeductRuleRule : rawExisting.hd_deduct_rule_rule,
      dto.hdDeductRuleDate !== undefined ? dto.hdDeductRuleDate : rawExisting.hd_deduct_rule_date,
      id,
    ];

    await this.connection.execute(sql, values);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.connection.execute(
      'DELETE FROM employee_policy_tagging WHERE id = $1',
      [id],
    );
  }
}
