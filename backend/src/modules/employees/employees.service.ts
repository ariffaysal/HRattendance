import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { SQL_CONNECTION } from '../../database/database.module';
import { getAllEmployeeFields } from '../../config/employee.config';
import { CreateEmployeeDto } from './dto/create-employee.dto';

export interface Employee {
  id: number;
  emp_code: string;
  emp_id: string;
  punch_card: string;
  full_name_bangla: string;
  full_name_english: string;
  fathers_name_bangla?: string;
  fathers_name?: string;
  mothers_name_bangla?: string;
  mothers_name?: string;
  spouse_name_bangla?: string;
  spouse_name?: string;
  blood_group?: string;
  gender?: string;
  birth_place?: string;
  date_of_birth?: string;
  age?: string;
  religion?: string;
  marital_status?: string;
  nationality?: string;
  national_id: string;
  mobile_no: string;
  category: string;
  company: string;
  location: string;
  division?: string;
  department: string;
  section?: string;
  subsection?: string;
  designation_level?: string;
  designation: string;
  functional_superior?: string;
  leave_app_process_use: string;
  leave_approving_authority: string;
  admin_superior?: string;
  joining_date: string;
  provisional_tenor: string;
  remark?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class EmployeesService {
  private readonly fields: string[];

  constructor(@Inject(SQL_CONNECTION) private readonly db: mysql.Connection) {
    this.fields = getAllEmployeeFields();
  }

  async findAll(search?: string): Promise<Employee[]> {
    let query = 'SELECT * FROM employees';
    const values: any[] = [];

    if (search) {
      query += ' WHERE full_name_english LIKE ? OR emp_code LIKE ? OR emp_id LIKE ?';
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await this.db.execute(query, values);
    return rows as Employee[];
  }

  async findById(id: number): Promise<Employee | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    const employees = rows as Employee[];
    return employees[0] || null;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Check for duplicates
    const [existingNationalId] = await this.db.execute(
      'SELECT id FROM employees WHERE national_id = ?',
      [dto.national_id]
    );
    if ((existingNationalId as any[]).length > 0) {
      throw new BadRequestException('National ID already exists');
    }

    const [existingMobile] = await this.db.execute(
      'SELECT id FROM employees WHERE mobile_no = ?',
      [dto.mobile_no]
    );
    if ((existingMobile as any[]).length > 0) {
      throw new BadRequestException('Mobile No already exists');
    }

    const fields = this.fields;
    const placeholders = fields.map(() => '?').join(', ');
    // Filter out 'undefined' string values that come from FormData conversion
    const values = fields.map(field => {
      const val = dto[field as keyof CreateEmployeeDto];
      return val !== undefined && val !== null && val !== 'undefined' ? val : '';
    });

    const query = `INSERT INTO employees (${fields.join(', ')}, created_at) VALUES (${placeholders}, NOW())`;

    const [result] = await this.db.execute(query, values);
    const insertResult = result as mysql.ResultSetHeader;
    const newId = insertResult.insertId;

    return this.findById(newId) as Promise<Employee>;
  }

  async update(id: number, dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    // Check for duplicates (exclude current employee)
    if (dto.national_id && dto.national_id !== existing.national_id) {
      const [existingNationalId] = await this.db.execute(
        'SELECT id FROM employees WHERE national_id = ? AND id != ?',
        [dto.national_id, id]
      );
      if ((existingNationalId as any[]).length > 0) {
        throw new BadRequestException('National ID already exists');
      }
    }

    if (dto.mobile_no && dto.mobile_no !== existing.mobile_no) {
      const [existingMobile] = await this.db.execute(
        'SELECT id FROM employees WHERE mobile_no = ? AND id != ?',
        [dto.mobile_no, id]
      );
      if ((existingMobile as any[]).length > 0) {
        throw new BadRequestException('Mobile No already exists');
      }
    }

    const fields = this.fields;
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    // Merge existing values with new values - preserve existing if new value is empty/undefined
    const values = fields.map(field => {
      const newValue = dto[field as keyof CreateEmployeeDto];
      const existingValue = existing[field as keyof Employee];
      const finalValue = newValue !== undefined && newValue !== null && newValue !== ''
        ? newValue
        : existingValue || '';
      return finalValue;
    });
    values.push(id.toString());

    const query = `UPDATE employees SET ${setClause}, updated_at = NOW() WHERE id = ?`;

    try {
      const [result] = await this.db.execute(query, values);
      const updateResult = result as mysql.ResultSetHeader;
      
      if (updateResult.affectedRows === 0) {
        throw new Error('Database update failed - no rows affected');
      }
    } catch (dbError) {
      console.error('[SERVICE] Database error:', dbError);
      throw dbError;
    }

    return this.findById(id) as Promise<Employee>;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    await this.db.execute('DELETE FROM employees WHERE id = ?', [id]);
  }
}
