import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

export const SQL_CONNECTION = 'SQL_CONNECTION';

// Mock connection for development when database is unavailable
class MockConnection {
  private employees: any[] = [
    { id: 1, emp_code: 'EMP001', full_name_english: 'John Doe', department: 'IT', designation: 'Developer', mobile_no: '1234567890', created_at: new Date() },
    { id: 2, emp_code: 'EMP002', full_name_english: 'Jane Smith', department: 'HR', designation: 'Manager', mobile_no: '0987654321', created_at: new Date() },
  ];
  private nextId = 3;
  private logs: any[] = []; // Mock attendance logs table
  private authUsers: any[] = []; // Mock auth_users table
  private nextAuthId = 1;

  async execute(sql: string, values?: any[]): Promise<[any, any]> {
    console.log('[MOCK] Execute:', sql.substring(0, 50) + '...');
    
    // Handle SELECT
    if (sql.includes('SELECT') && sql.includes('employees')) {
      if (sql.includes('WHERE') && sql.includes('id')) {
        const id = values?.[0];
        const employee = this.employees.find(e => e.id === id);
        return [[employee || null], []];
      }
      return [this.employees, []];
    }
    
    // Handle INSERT
    if (sql.includes('INSERT') && sql.includes('employees')) {
      const newId = this.nextId++;
      const newEmployee: any = { id: newId, created_at: new Date() };
      
      // Map values to fields
      const fields = ['emp_code', 'emp_id', 'punch_card', 'full_name_bangla', 'full_name_english', 'national_id', 'mobile_no', 'category', 'company', 'location', 'department', 'designation', 'leave_app_process_use', 'leave_approving_authority', 'joining_date', 'provisional_tenor'];
      if (values) {
        fields.forEach((field, index) => {
          if (values[index] !== undefined) {
            newEmployee[field] = values[index];
          }
        });
      }
      
      this.employees.push(newEmployee);
      return [{ insertId: newId }, []];
    }
    
    // Handle UPDATE
    if (sql.includes('UPDATE') && sql.includes('employees')) {
      const id = values?.[values.length - 1];
      const employee = this.employees.find(e => e.id === id);
      if (employee) {
        employee.updated_at = new Date();
      }
      return [{ affectedRows: employee ? 1 : 0 }, []];
    }
    
    // Handle DELETE
    if (sql.includes('DELETE') && sql.includes('employees')) {
      const id = values?.[0];
      const index = this.employees.findIndex(e => e.id === id);
      if (index > -1) {
        this.employees.splice(index, 1);
      }
      return [{ affectedRows: index > -1 ? 1 : 0 }, []];
    }
    
    // Handle logs table (attendance)
    if (sql.includes('TRUNCATE') && sql.includes('logs')) {
      this.logs = [];
      return [{ affectedRows: 0 }, []];
    }
    if (sql.includes('INSERT') && sql.includes('logs')) {
      // Batch inserts pass flat values; chunk back into records of column count
      const COLUMN_COUNT = 29;
      for (let i = 0; i < (values?.length || 0); i += COLUMN_COUNT) {
        this.logs.push(values!.slice(i, i + COLUMN_COUNT));
      }
      return [{ affectedRows: Math.ceil((values?.length || 0) / COLUMN_COUNT) }, []];
    }
    if (sql.includes('SELECT') && sql.includes('logs')) {
      if (sql.includes('COUNT(*)')) {
        return [[{ total: this.logs.length }], []];
      }
      // Map stored arrays back to column-keyed objects for the attendance service
      const LOG_COLUMNS = ['Emp No.', 'AC-No.', 'No.', 'Name', 'Auto-Assign', 'Date', 'Timetable', 'On duty', 'Off duty', 'Clock In', 'Clock Out', 'Normal', 'Real time', 'Late', 'Early', 'Absent', 'OT Time', 'Work Time', 'Exception', 'Must C/In', 'Must C/Out', 'Department', 'NDays', 'WeekEnd', 'Holiday', 'ATT_Time', 'NDays_OT', 'WeekEnd_OT', 'Holiday_OT'];
      return [this.logs.map(row => {
        const obj: any = {};
        LOG_COLUMNS.forEach((col, i) => { obj[col] = row[i] ?? null; });
        return obj;
      }), []];
    }

    // Handle auth_users table (register/login)
    if (sql.includes('SELECT') && sql.includes('auth_users')) {
      const employeeId = values?.[0];
      const user = this.authUsers.find(u => u.employee_id === employeeId);
      return [user ? [user] : [], []];
    }
    if (sql.includes('INSERT') && sql.includes('auth_users')) {
      const user: any = { id: this.nextAuthId++, is_active: 1, created_at: new Date() };
      const fields = ['employee_id', 'email', 'mobile_number', 'password_hash'];
      fields.forEach((field, index) => {
        if (values?.[index] !== undefined) {
          user[field] = values[index];
        }
      });
      this.authUsers.push(user);
      return [{ insertId: user.id }, []];
    }
    if (sql.includes('UPDATE') && sql.includes('auth_users')) {
      const id = values?.[values.length - 1];
      const user = this.authUsers.find(u => u.id === id);
      if (user) {
        if (sql.includes('password_hash')) user.password_hash = values?.[0];
        if (sql.includes('last_login')) user.last_login = new Date();
      }
      return [{ affectedRows: user ? 1 : 0 }, []];
    }
    
    return [[], []];
  }

  async query(sql: string, values?: any[]): Promise<[any, any]> {
    return this.execute(sql, values);
  }

  async end(): Promise<void> {
    return Promise.resolve();
  }
}

@Module({
  providers: [
    {
      provide: SQL_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<mysql.Connection | MockConnection> => {
        const useMock = configService.get<string>('USE_MOCK_DB') === 'true';
        
        if (useMock) {
          console.log('[DEV MODE] Mock database enabled - set USE_MOCK_DB=false to use real MySQL');
          return new MockConnection();
        }

        // MySQL connection for XAMPP
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = parseInt(configService.get<string>('DB_PORT') || '3306');
        const database = configService.get<string>('DB_NAME') || 'attendance_db';
        const user = configService.get<string>('DB_USER') || 'root';
        const password = configService.get<string>('DB_PASSWORD') || '';

        try {
          console.log(`Connecting to MySQL: ${host}:${port}/${database}`);
          const connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            database,
            connectTimeout: 10000,
          });
          console.log('Connected to MySQL successfully');

          // Create logs table if it doesn't exist (never drop - that would wipe attendance data)
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS logs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              \`Emp No.\` VARCHAR(50),
              \`AC-No.\` VARCHAR(50),
              \`No.\` VARCHAR(50),
              \`Name\` VARCHAR(200),
              \`Auto-Assign\` VARCHAR(50),
              \`Date\` VARCHAR(20),
              \`Timetable\` VARCHAR(50),
              \`On duty\` VARCHAR(10),
              \`Off duty\` VARCHAR(10),
              \`Clock In\` VARCHAR(10),
              \`Clock Out\` VARCHAR(10),
              \`Normal\` VARCHAR(10),
              \`Real time\` VARCHAR(10),
              \`Late\` VARCHAR(10),
              \`Early\` VARCHAR(10),
              \`Absent\` VARCHAR(10),
              \`OT Time\` VARCHAR(10),
              \`Work Time\` VARCHAR(10),
              \`Exception\` VARCHAR(100),
              \`Must C/In\` VARCHAR(10),
              \`Must C/Out\` VARCHAR(10),
              \`Department\` VARCHAR(100),
              \`NDays\` VARCHAR(10),
              \`WeekEnd\` VARCHAR(10),
              \`Holiday\` VARCHAR(10),
              \`ATT_Time\` VARCHAR(10),
              \`NDays_OT\` VARCHAR(10),
              \`WeekEnd_OT\` VARCHAR(10),
              \`Holiday_OT\` VARCHAR(10),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('Logs table ready');
          
          // Create employee_addresses table if it doesn't exist
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS employee_addresses (
              id INT AUTO_INCREMENT PRIMARY KEY,
              emp_code VARCHAR(50) NOT NULL,
              category VARCHAR(50),
              company VARCHAR(100),
              location VARCHAR(100),
              division_org VARCHAR(100),
              department VARCHAR(100),
              section VARCHAR(100),
              subsection VARCHAR(100),
              designation VARCHAR(100),
              present_village_area VARCHAR(200),
              present_house_no VARCHAR(50),
              present_road_no VARCHAR(50),
              present_post_office_code VARCHAR(20),
              present_thana VARCHAR(100),
              present_district VARCHAR(100),
              present_division_geo VARCHAR(100),
              present_land_phone VARCHAR(20),
              present_cell_phone VARCHAR(20),
              present_email VARCHAR(100),
              is_same_as_present TINYINT(1) DEFAULT 0,
              permanent_village_area VARCHAR(200),
              permanent_house_no VARCHAR(50),
              permanent_road_no VARCHAR(50),
              permanent_post_office_code VARCHAR(20),
              permanent_thana VARCHAR(100),
              permanent_district VARCHAR(100),
              permanent_division_geo VARCHAR(100),
              permanent_land_phone VARCHAR(20),
              permanent_cell_phone VARCHAR(20),
              permanent_email VARCHAR(100),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY unique_emp_code (emp_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          // Create employee_education table if it doesn't exist
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS employee_education (
              id INT AUTO_INCREMENT PRIMARY KEY,
              emp_code VARCHAR(50) NOT NULL,
              emp_id VARCHAR(50),
              emp_name VARCHAR(100),
              category VARCHAR(100),
              company VARCHAR(100),
              location VARCHAR(100),
              division VARCHAR(100),
              department VARCHAR(100),
              section VARCHAR(100),
              subsection VARCHAR(100),
              designation VARCHAR(100),
              course_name VARCHAR(100),
              board VARCHAR(100),
              institution VARCHAR(200),
              discipline VARCHAR(100),
              major_subject VARCHAR(100),
              year VARCHAR(10),
              result VARCHAR(50),
              education_nature VARCHAR(50) DEFAULT 'Academic',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_emp_code (emp_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('Employee education table ready');

          // Create auth_users table for authentication
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS auth_users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              employee_id VARCHAR(50) NOT NULL UNIQUE,
              email VARCHAR(100) NOT NULL UNIQUE,
              mobile_number VARCHAR(20) NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              is_active TINYINT(1) DEFAULT 1,
              last_login TIMESTAMP NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_employee_id (employee_id),
              INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('Auth users table ready');
          
          return connection;
        } catch (error) {
          // Fail loudly instead of silently switching to an in-memory mock.
          // A silent fallback makes the app look like it works while persisting nothing.
          console.error('MySQL connection failed:', error.message);
          console.error('Set USE_MOCK_DB=true in .env to run with the in-memory mock database for development.');
          throw error;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [SQL_CONNECTION],
})
export class DatabaseModule {}
