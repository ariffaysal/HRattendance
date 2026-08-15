import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

export const SQL_CONNECTION = 'SQL_CONNECTION';

// Thin adapter that keeps the mysql2-style API the services already use:
//   const [rows] = await db.execute(sql, values)        -> SELECT rows
//   const [rows, result] = await db.execute(...)        -> result.rowCount for UPDATE/DELETE
//   INSERT ... RETURNING id -> rows[0].id
export class PgConnection {
  constructor(private readonly client: Client) {}

  async execute(sql: string, values?: any[]): Promise<[any[], any]> {
    const result = await this.client.query(sql, values);
    return [result.rows, result];
  }

  async query(sql: string, values?: any[]): Promise<[any[], any]> {
    return this.execute(sql, values);
  }

  async end(): Promise<void> {
    await this.client.end();
  }
}

// Mock connection for development when the database is unavailable.
// Mirrors the [rows, result] shape returned by PgConnection.execute().
class MockConnection {
  private employees: any[] = [
    { id: 1, emp_code: 'EMP001', full_name_english: 'John Doe', department: 'IT', designation: 'Developer', mobile_no: '1234567890', created_at: new Date() },
    { id: 2, emp_code: 'EMP002', full_name_english: 'Jane Smith', department: 'HR', designation: 'Manager', mobile_no: '0987654321', created_at: new Date() },
  ];
  private nextId = 3;
  private logs: any[] = []; // Mock attendance logs table
  private authUsers: any[] = []; // Mock auth_users table
  private nextAuthId = 1;

  async execute(sql: string, values?: any[]): Promise<[any[], any]> {
    console.log('[MOCK] Execute:', sql.substring(0, 50) + '...');
    const emptyResult = { rowCount: 0 };

    // Handle SELECT
    if (sql.includes('SELECT') && sql.includes('employees')) {
      if (sql.includes('WHERE') && sql.includes('id')) {
        const id = values?.[0];
        const employee = this.employees.find(e => e.id === id);
        return [[employee || null], emptyResult];
      }
      return [this.employees, emptyResult];
    }

    // Handle INSERT (services read the generated id from rows[0].id via RETURNING id)
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
      return [[{ id: newId }], { rowCount: 1 }];
    }

    // Handle UPDATE
    if (sql.includes('UPDATE') && sql.includes('employees')) {
      const id = values?.[values.length - 1];
      const employee = this.employees.find(e => e.id === id);
      if (employee) {
        employee.updated_at = new Date();
      }
      return [[], { rowCount: employee ? 1 : 0 }];
    }

    // Handle DELETE
    if (sql.includes('DELETE') && sql.includes('employees')) {
      const id = values?.[0];
      const index = this.employees.findIndex(e => e.id === id);
      if (index > -1) {
        this.employees.splice(index, 1);
      }
      return [[], { rowCount: index > -1 ? 1 : 0 }];
    }

    // Handle logs table (attendance)
    if (sql.includes('TRUNCATE') && sql.includes('logs')) {
      this.logs = [];
      return [[], emptyResult];
    }
    if (sql.includes('INSERT') && sql.includes('logs')) {
      // Batch inserts pass flat values; chunk back into records of column count
      const COLUMN_COUNT = 29;
      for (let i = 0; i < (values?.length || 0); i += COLUMN_COUNT) {
        this.logs.push(values!.slice(i, i + COLUMN_COUNT));
      }
      return [[], { rowCount: Math.ceil((values?.length || 0) / COLUMN_COUNT) }];
    }
    if (sql.includes('SELECT') && sql.includes('logs')) {
      if (sql.includes('COUNT(*)')) {
        return [[{ total: this.logs.length }], emptyResult];
      }
      // Map stored arrays back to column-keyed objects for the attendance service
      const LOG_COLUMNS = ['Emp No.', 'AC-No.', 'No.', 'Name', 'Auto-Assign', 'Date', 'Timetable', 'On duty', 'Off duty', 'Clock In', 'Clock Out', 'Normal', 'Real time', 'Late', 'Early', 'Absent', 'OT Time', 'Work Time', 'Exception', 'Must C/In', 'Must C/Out', 'Department', 'NDays', 'WeekEnd', 'Holiday', 'ATT_Time', 'NDays_OT', 'WeekEnd_OT', 'Holiday_OT'];
      return [this.logs.map(row => {
        const obj: any = {};
        LOG_COLUMNS.forEach((col, i) => { obj[col] = row[i] ?? null; });
        return obj;
      }), emptyResult];
    }

    // Handle auth_users table (register/login)
    if (sql.includes('SELECT') && sql.includes('auth_users')) {
      const employeeId = values?.[0];
      const user = this.authUsers.find(u => u.employee_id === employeeId);
      return [user ? [user] : [], emptyResult];
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
      return [[{ id: user.id }], { rowCount: 1 }];
    }
    if (sql.includes('UPDATE') && sql.includes('auth_users')) {
      const id = values?.[values.length - 1];
      const user = this.authUsers.find(u => u.id === id);
      if (user) {
        if (sql.includes('password_hash')) user.password_hash = values?.[0];
        if (sql.includes('last_login')) user.last_login = new Date();
      }
      return [[], { rowCount: user ? 1 : 0 }];
    }

    return [[], emptyResult];
  }

  async query(sql: string, values?: any[]): Promise<[any[], any]> {
    return this.execute(sql, values);
  }

  async end(): Promise<void> {
    return Promise.resolve();
  }
}

// Keeps updated_at current on UPDATE, replicating MySQL's ON UPDATE CURRENT_TIMESTAMP.
const SET_UPDATED_AT_TRIGGER = `
  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`;

@Module({
  providers: [
    {
      provide: SQL_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<PgConnection | MockConnection> => {
        const useMock = configService.get<string>('USE_MOCK_DB') === 'true';

        if (useMock) {
          console.log('[DEV MODE] Mock database enabled - set USE_MOCK_DB=false to use real PostgreSQL');
          return new MockConnection();
        }

        // PostgreSQL connection (Docker Desktop: docker compose up -d)
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = parseInt(configService.get<string>('DB_PORT') || '5432');
        const database = configService.get<string>('DB_NAME') || 'attendance_db';
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';

        try {
          console.log(`Connecting to PostgreSQL: ${host}:${port}/${database}`);
          const client = new Client({
            host,
            port,
            user,
            password,
            database,
            connectionTimeoutMillis: 10000,
          });
          await client.connect();
          console.log('Connected to PostgreSQL successfully');

          // Create logs table if it doesn't exist (never drop - that would wipe attendance data)
          await client.query(`
            CREATE TABLE IF NOT EXISTS logs (
              id SERIAL PRIMARY KEY,
              "Emp No." VARCHAR(50),
              "AC-No." VARCHAR(50),
              "No." VARCHAR(50),
              "Name" VARCHAR(200),
              "Auto-Assign" VARCHAR(50),
              "Date" VARCHAR(20),
              "Timetable" VARCHAR(50),
              "On duty" VARCHAR(10),
              "Off duty" VARCHAR(10),
              "Clock In" VARCHAR(10),
              "Clock Out" VARCHAR(10),
              "Normal" VARCHAR(10),
              "Real time" VARCHAR(10),
              "Late" VARCHAR(10),
              "Early" VARCHAR(10),
              "Absent" VARCHAR(10),
              "OT Time" VARCHAR(10),
              "Work Time" VARCHAR(10),
              "Exception" VARCHAR(100),
              "Must C/In" VARCHAR(10),
              "Must C/Out" VARCHAR(10),
              "Department" VARCHAR(100),
              "NDays" VARCHAR(10),
              "WeekEnd" VARCHAR(10),
              "Holiday" VARCHAR(10),
              "ATT_Time" VARCHAR(10),
              "NDays_OT" VARCHAR(10),
              "WeekEnd_OT" VARCHAR(10),
              "Holiday_OT" VARCHAR(10),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('Logs table ready');

          // Create employee_addresses table if it doesn't exist
          await client.query(`
            CREATE TABLE IF NOT EXISTS employee_addresses (
              id SERIAL PRIMARY KEY,
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
              is_same_as_present SMALLINT DEFAULT 0,
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
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT unique_emp_code UNIQUE (emp_code)
            )
          `);
          // Create employee_education table if it doesn't exist
          await client.query(`
            CREATE TABLE IF NOT EXISTS employee_education (
              id SERIAL PRIMARY KEY,
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
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('Employee education table ready');

          // Create auth_users table for authentication
          await client.query(`
            CREATE TABLE IF NOT EXISTS auth_users (
              id SERIAL PRIMARY KEY,
              employee_id VARCHAR(50) NOT NULL UNIQUE,
              email VARCHAR(100) NOT NULL UNIQUE,
              mobile_number VARCHAR(20) NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              is_active SMALLINT DEFAULT 1,
              last_login TIMESTAMP NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('Auth users table ready');

          // Append-only audit trail - every mutation and sensitive event is recorded.
          await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
              id SERIAL PRIMARY KEY,
              actor_id INTEGER,
              actor_employee_id VARCHAR(50),
              action VARCHAR(50) NOT NULL,
              entity VARCHAR(100) NOT NULL,
              entity_id VARCHAR(100),
              details JSONB,
              ip VARCHAR(45),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          await client.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity, entity_id)
          `);
          await client.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at)
          `);
          console.log('Audit logs table ready');

          // Replicate MySQL's ON UPDATE CURRENT_TIMESTAMP for the tables created here.
          await client.query(SET_UPDATED_AT_TRIGGER);
          await client.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_employee_addresses') THEN
                CREATE TRIGGER set_updated_at_employee_addresses
                  BEFORE UPDATE ON employee_addresses
                  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
              END IF;
              IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_employee_education') THEN
                CREATE TRIGGER set_updated_at_employee_education
                  BEFORE UPDATE ON employee_education
                  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
              END IF;
              IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_auth_users') THEN
                CREATE TRIGGER set_updated_at_auth_users
                  BEFORE UPDATE ON auth_users
                  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
              END IF;
            END
            $$;
          `);

          return new PgConnection(client);
        } catch (error) {
          // Fail loudly instead of silently switching to an in-memory mock.
          // A silent fallback makes the app look like it works while persisting nothing.
          console.error('PostgreSQL connection failed:', error.message);
          console.error('Start the database with: docker compose up -d');
          console.error('Or set USE_MOCK_DB=true in .env to run with the in-memory mock database for development.');
          throw error;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [SQL_CONNECTION],
})
export class DatabaseModule {}
