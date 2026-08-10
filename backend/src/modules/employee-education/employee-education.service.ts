import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { SQL_CONNECTION } from '../../database/database.module';
import { CreateEmployeeEducationDto, UpdateEmployeeEducationDto } from './dto/create-employee-education.dto';

@Injectable()
export class EmployeeEducationService {
  constructor(
    @Inject(SQL_CONNECTION) private connection: mysql.Connection,
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
      courseName: row.course_name,
      board: row.board,
      institution: row.institution,
      discipline: row.discipline,
      majorSubject: row.major_subject,
      year: row.year,
      result: row.result,
      educationNature: row.education_nature,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(search?: string): Promise<any[]> {
    let query = 'SELECT * FROM employee_education';
    const params: any[] = [];

    if (search) {
      query += ' WHERE emp_code LIKE ? OR emp_name LIKE ? OR course_name LIKE ? OR institution LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await this.connection.execute(query, params);
    return (rows as any[]).map(row => this.transformToCamelCase(row));
  }

  async findOne(id: number): Promise<any> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_education WHERE id = ?',
      [id],
    );
    
    const educations = rows as any[];
    if (educations.length === 0) {
      throw new NotFoundException('Employee education not found');
    }
    return this.transformToCamelCase(educations[0]);
  }

  async findByEmpCode(empCode: string): Promise<any[]> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM employee_education WHERE emp_code = ? ORDER BY created_at DESC',
      [empCode],
    );
    
    const educations = rows as any[];
    return educations.map(row => this.transformToCamelCase(row));
  }

  async create(dto: CreateEmployeeEducationDto): Promise<any> {
    const sql = `
      INSERT INTO employee_education (
        emp_code, emp_id, emp_name, category, company, location, division, department, 
        section, subsection, designation, course_name, board, institution, discipline, 
        major_subject, year, result, education_nature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      dto.courseName || null,
      dto.board || null,
      dto.institution || null,
      dto.discipline || null,
      dto.majorSubject || null,
      dto.year || null,
      dto.result || null,
      dto.educationNature || 'Academic',
    ];

    const [result] = await this.connection.execute(sql, values);
    const insertId = (result as mysql.OkPacket).insertId;
    return this.findOne(insertId);
  }

  async update(id: number, dto: UpdateEmployeeEducationDto): Promise<any> {
    await this.findOne(id);
    
    const [existingRows] = await this.connection.execute(
      'SELECT * FROM employee_education WHERE id = ?',
      [id],
    );
    const rawExisting = (existingRows as any[])[0];

    const sql = `
      UPDATE employee_education SET
        emp_code = ?,
        emp_id = ?,
        emp_name = ?,
        category = ?,
        company = ?,
        location = ?,
        division = ?,
        department = ?,
        section = ?,
        subsection = ?,
        designation = ?,
        course_name = ?,
        board = ?,
        institution = ?,
        discipline = ?,
        major_subject = ?,
        year = ?,
        result = ?,
        education_nature = ?
      WHERE id = ?
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
      dto.courseName !== undefined ? dto.courseName : rawExisting.course_name,
      dto.board !== undefined ? dto.board : rawExisting.board,
      dto.institution !== undefined ? dto.institution : rawExisting.institution,
      dto.discipline !== undefined ? dto.discipline : rawExisting.discipline,
      dto.majorSubject !== undefined ? dto.majorSubject : rawExisting.major_subject,
      dto.year !== undefined ? dto.year : rawExisting.year,
      dto.result !== undefined ? dto.result : rawExisting.result,
      dto.educationNature !== undefined ? dto.educationNature : rawExisting.education_nature,
      id,
    ];

    await this.connection.execute(sql, values);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.connection.execute(
      'DELETE FROM employee_education WHERE id = ?',
      [id],
    );
  }
}
