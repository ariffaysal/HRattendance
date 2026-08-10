import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PgConnection, SQL_CONNECTION } from '../../database/database.module';
import { CreateEmployeeSalaryInformationDto, UpdateEmployeeSalaryInformationDto, BankInfoDto, SalaryBreakdownDto } from './dto/create-employee-salary-information.dto';

@Injectable()
export class EmployeeSalaryInformationService {
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
      sGrade: row.s_grade,
      stSalary: row.st_salary,
      grossSalary: row.gross_salary,
      bGross: row.b_gross,
      cashDisbursement: row.cash_disbursement,
      policy: row.policy,
      mode: row.mode,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformBankInfoToCamelCase(row: any): any {
    if (!row) return null;
    return {
      id: row.id,
      empCode: row.emp_code,
      salaryBank: row.salary_bank,
      branchName: row.branch_name,
      accountNo: row.account_no,
      salaryAmount: row.salary_amount,
      salaryPeriod: row.salary_period,
      showTax: row.show_tax,
      sequence: row.sequence,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformSalaryBreakdownToCamelCase(row: any): any {
    if (!row) return null;
    return {
      id: row.id,
      empCode: row.emp_code,
      payrollHead: row.payroll_head,
      type: row.type,
      percentageFormula: row.percentage_formula,
      baseHead: row.base_head,
      amount: row.amount,
      sequence: row.sequence,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(search?: string): Promise<any[]> {
    let query = 'SELECT * FROM employee_salary_information';
    const params: any[] = [];

    if (search) {
      query += ' WHERE emp_code LIKE $1 OR emp_name LIKE $2 OR department LIKE $3';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await this.connection.execute(query, params);
    return (rows as any[]).map(row => this.transformToCamelCase(row));
  }

  async findOne(id: number): Promise<any> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_salary_information WHERE id = $1',
      [id],
    );
    
    const records = rows as any[];
    if (records.length === 0) {
      throw new NotFoundException('Employee salary information not found');
    }
    
    const salaryInfo = this.transformToCamelCase(records[0]);
    salaryInfo.bankInfos = await this.findBankInfosByEmpCode(salaryInfo.empCode);
    salaryInfo.salaryBreakdown = await this.findSalaryBreakdownByEmpCode(salaryInfo.empCode);
    
    return salaryInfo;
  }

  async findByEmpCode(empCode: string): Promise<any> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_salary_information WHERE emp_code = $1',
      [empCode],
    );
    
    const records = rows as any[];
    if (records.length === 0) {
      throw new NotFoundException('Employee salary information not found');
    }
    
    const salaryInfo = this.transformToCamelCase(records[0]);
    salaryInfo.bankInfos = await this.findBankInfosByEmpCode(empCode);
    salaryInfo.salaryBreakdown = await this.findSalaryBreakdownByEmpCode(empCode);
    
    return salaryInfo;
  }

  async findBankInfosByEmpCode(empCode: string): Promise<any[]> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_salary_bank_info WHERE emp_code = $1 ORDER BY sequence ASC',
      [empCode],
    );
    
    return (rows as any[]).map(row => this.transformBankInfoToCamelCase(row));
  }

  async findSalaryBreakdownByEmpCode(empCode: string): Promise<any[]> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_salary_breakdown WHERE emp_code = $1 ORDER BY sequence ASC',
      [empCode],
    );
    
    return (rows as any[]).map(row => this.transformSalaryBreakdownToCamelCase(row));
  }

  async create(dto: CreateEmployeeSalaryInformationDto): Promise<any> {
    // Insert main salary information
    const sql = `
      INSERT INTO employee_salary_information (
        emp_code, emp_id, emp_name, category, company, location, division, department, 
        section, subsection, designation, s_grade, st_salary, gross_salary, b_gross,
        cash_disbursement, policy, mode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
      dto.sGrade || null,
      dto.stSalary || null,
      dto.grossSalary || null,
      dto.bGross || null,
      dto.cashDisbursement || 'No',
      dto.policy || null,
      dto.mode || 'Actual',
    ];

    const [rows] = await this.connection.execute(sql, values);
    const insertId = (rows as any[])[0].id;

    // Insert bank information if provided
    if (dto.bankInfos && dto.bankInfos.length > 0) {
      await this.createBankInfos(dto.empCode, dto.bankInfos);
    }

    // Insert salary breakdown if provided
    if (dto.salaryBreakdown && dto.salaryBreakdown.length > 0) {
      await this.createSalaryBreakdowns(dto.empCode, dto.salaryBreakdown);
    }

    return this.findOne(insertId);
  }

  async createBankInfos(empCode: string, bankInfos: BankInfoDto[]): Promise<void> {
    const sql = `
      INSERT INTO employee_salary_bank_info (
        emp_code, salary_bank, branch_name, account_no, salary_amount, 
        salary_period, show_tax, sequence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (const bank of bankInfos) {
      const values = [
        empCode,
        bank.salaryBank || null,
        bank.branchName || null,
        bank.accountNo || null,
        bank.salaryAmount || null,
        bank.salaryPeriod || null,
        bank.showTax || 'Yes',
        bank.sequence || '1',
      ];
      await this.connection.execute(sql, values);
    }
  }

  async createSalaryBreakdowns(empCode: string, salaryBreakdown: SalaryBreakdownDto[]): Promise<void> {
    const sql = `
      INSERT INTO employee_salary_breakdown (
        emp_code, payroll_head, type, percentage_formula, base_head, amount, sequence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const item of salaryBreakdown) {
      const values = [
        empCode,
        item.payrollHead || null,
        item.type || null,
        item.percentageFormula || null,
        item.baseHead || null,
        item.amount || null,
        item.sequence || '1',
      ];
      await this.connection.execute(sql, values);
    }
  }

  async update(id: number, dto: UpdateEmployeeSalaryInformationDto): Promise<any> {
    const existing = await this.findOne(id);
    
    const sql = `
      UPDATE employee_salary_information SET
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
        s_grade = $12,
        st_salary = $13,
        gross_salary = $14,
        b_gross = $15,
        cash_disbursement = $16,
        policy = $17,
        mode = $18
      WHERE id = $19
    `;

    const values = [
      dto.empCode || existing.empCode,
      dto.empId !== undefined ? dto.empId : existing.empId,
      dto.empName !== undefined ? dto.empName : existing.empName,
      dto.category !== undefined ? dto.category : existing.category,
      dto.company !== undefined ? dto.company : existing.company,
      dto.location !== undefined ? dto.location : existing.location,
      dto.division !== undefined ? dto.division : existing.division,
      dto.department !== undefined ? dto.department : existing.department,
      dto.section !== undefined ? dto.section : existing.section,
      dto.subsection !== undefined ? dto.subsection : existing.subsection,
      dto.designation !== undefined ? dto.designation : existing.designation,
      dto.sGrade !== undefined ? dto.sGrade : existing.sGrade,
      dto.stSalary !== undefined ? dto.stSalary : existing.stSalary,
      dto.grossSalary !== undefined ? dto.grossSalary : existing.grossSalary,
      dto.bGross !== undefined ? dto.bGross : existing.bGross,
      dto.cashDisbursement !== undefined ? dto.cashDisbursement : existing.cashDisbursement,
      dto.policy !== undefined ? dto.policy : existing.policy,
      dto.mode !== undefined ? dto.mode : existing.mode,
      id,
    ];

    await this.connection.execute(sql, values);

    // Update bank information if provided
    if (dto.bankInfos && dto.bankInfos.length > 0) {
      // Delete existing bank infos and recreate
      await this.connection.execute(
        'DELETE FROM employee_salary_bank_info WHERE emp_code = $1',
        [dto.empCode || existing.empCode],
      );
      await this.createBankInfos(dto.empCode || existing.empCode, dto.bankInfos);
    }

    // Update salary breakdown if provided
    if (dto.salaryBreakdown && dto.salaryBreakdown.length > 0) {
      // Delete existing salary breakdown and recreate
      await this.connection.execute(
        'DELETE FROM employee_salary_breakdown WHERE emp_code = $1',
        [dto.empCode || existing.empCode],
      );
      await this.createSalaryBreakdowns(dto.empCode || existing.empCode, dto.salaryBreakdown);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    
    // Delete salary breakdown first (cascade should handle this, but just to be safe)
    await this.connection.execute(
      'DELETE FROM employee_salary_breakdown WHERE emp_code = $1',
      [existing.empCode],
    );
    
    // Delete bank infos first (cascade should handle this, but just to be safe)
    await this.connection.execute(
      'DELETE FROM employee_salary_bank_info WHERE emp_code = $1',
      [existing.empCode],
    );
    
    // Delete main record
    await this.connection.execute(
      'DELETE FROM employee_salary_information WHERE id = $1',
      [id],
    );
  }
}
