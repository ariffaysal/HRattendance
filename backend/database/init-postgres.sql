-- ============================================================================
-- PostgreSQL schema for the Attendance System
-- Used automatically by Docker on first start (docker compose up -d).
-- Can also be run manually:  psql -U postgres -d attendance_db -f init-postgres.sql
-- ============================================================================

-- Keeps updated_at current on UPDATE, replicating MySQL's ON UPDATE CURRENT_TIMESTAMP.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- employees
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,

    -- Basic Info
    emp_code VARCHAR(50),
    emp_id VARCHAR(50),
    punch_card VARCHAR(50),
    ac_no VARCHAR(50),

    -- Name Fields
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name_bangla VARCHAR(200),
    full_name_english VARCHAR(200),

    -- Family Fields
    fathers_name VARCHAR(200),
    fathers_name_bangla VARCHAR(200),
    mothers_name VARCHAR(200),
    mothers_name_bangla VARCHAR(200),
    spouse_name VARCHAR(200),
    spouse_name_bangla VARCHAR(200),

    -- Personal Fields
    blood_group VARCHAR(10),
    gender VARCHAR(20),
    birth_place VARCHAR(100),
    date_of_birth VARCHAR(20),
    age VARCHAR(10),
    religion VARCHAR(50),
    marital_status VARCHAR(20),
    nationality VARCHAR(50),
    national_id VARCHAR(50),
    mobile_no VARCHAR(20),
    birth_registration VARCHAR(50),

    -- Job Fields
    category VARCHAR(50),
    company VARCHAR(100),
    location VARCHAR(100),
    division VARCHAR(100),
    department VARCHAR(100),
    section VARCHAR(100),
    subsection VARCHAR(100),
    designation_level VARCHAR(50),
    designation VARCHAR(100),
    functional_superior VARCHAR(100),
    leave_approving_authority VARCHAR(100),
    admin_superior VARCHAR(100),
    joining_date VARCHAR(20),
    provisional_tenor VARCHAR(50),
    target_confirm_date VARCHAR(20),
    actual_confirmation_date VARCHAR(20),
    skill_tagging VARCHAR(50),
    skill_rank VARCHAR(50),
    is_salary_restricted VARCHAR(10),
    is_attendance_restricted VARCHAR(10),
    reference VARCHAR(200),
    remark TEXT,
    leave_app_process_use VARCHAR(100),
    types_of_work VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',

    -- Media Fields
    employee_image VARCHAR(500),
    employee_signature VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO employees (emp_code, first_name, last_name, department, designation, status) VALUES
('EMP001', 'John', 'Doe', 'IT', 'Developer', 'Active'),
('EMP002', 'Jane', 'Smith', 'HR', 'Manager', 'Active');

-- ----------------------------------------------------------------------------
-- attendance (monthly reports)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL,
    day INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    status VARCHAR(5),
    in_time VARCHAR(10),
    out_time VARCHAR(10),
    ot VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_attendance UNIQUE (emp_id, day, month, year)
);

-- ----------------------------------------------------------------------------
-- employee_addresses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_addresses (
    id SERIAL PRIMARY KEY,

    -- Employee Identification
    emp_code VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    company VARCHAR(100),
    location VARCHAR(100),
    division_org VARCHAR(100),
    department VARCHAR(100),
    section VARCHAR(100),
    subsection VARCHAR(100),
    designation VARCHAR(100),

    -- Present Address
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

    -- Permanent Address
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

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_emp_code UNIQUE (emp_code)
);

-- ----------------------------------------------------------------------------
-- employee_education
-- ----------------------------------------------------------------------------
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
);

CREATE INDEX IF NOT EXISTS idx_employee_education_emp_code ON employee_education (emp_code);

-- ----------------------------------------------------------------------------
-- employee_policy_tagging
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_policy_tagging (
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

    -- Policy Fields
    overtime_policy_rule VARCHAR(50),
    overtime_policy_date DATE,
    holiday_incentive_rule VARCHAR(50),
    holiday_incentive_date DATE,
    duty_roster_policy_rule VARCHAR(50),
    duty_roster_policy_date DATE,
    leave_policy_rule VARCHAR(50),
    leave_policy_date DATE,
    maternity_leave_policy_rule VARCHAR(50),
    maternity_leave_policy_date DATE,
    attendance_bonus_policy_rule VARCHAR(50),
    attendance_bonus_policy_date DATE,
    absent_deduction_policy_rule VARCHAR(50),
    absent_deduction_policy_date DATE,
    late_deduction_policy_rule VARCHAR(50),
    late_deduction_policy_date DATE,
    bonus_policy_rule VARCHAR(50),
    bonus_policy_date DATE,
    tax_policy_rule VARCHAR(50),
    tax_policy_date DATE,
    shift_policy_rule VARCHAR(50),
    shift_policy_date DATE,
    tiffin_bill_policy_rule VARCHAR(50),
    tiffin_bill_policy_date DATE,
    allowance_policy_rule VARCHAR(50),
    allowance_policy_date DATE,
    early_out_deduction_policy_rule VARCHAR(50),
    early_out_deduction_policy_date DATE,
    service_benefit_policy_rule VARCHAR(50),
    service_benefit_policy_date DATE,
    hd_deduct_rule_rule VARCHAR(50),
    hd_deduct_rule_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_policy_tagging_emp_code UNIQUE (emp_code)
);

CREATE INDEX IF NOT EXISTS idx_employee_policy_tagging_emp_code ON employee_policy_tagging (emp_code);

-- ----------------------------------------------------------------------------
-- employee_salary_information (+ bank info, breakdown)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_salary_information (
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

    -- Salary Information Fields
    s_grade VARCHAR(50),
    st_salary VARCHAR(50),
    gross_salary VARCHAR(50),
    b_gross VARCHAR(50),
    cash_disbursement VARCHAR(10) DEFAULT 'No',
    policy VARCHAR(100),
    mode VARCHAR(50) DEFAULT 'Actual',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_salary_info_emp_code UNIQUE (emp_code)
);

CREATE INDEX IF NOT EXISTS idx_employee_salary_information_emp_code ON employee_salary_information (emp_code);

CREATE TABLE IF NOT EXISTS employee_salary_bank_info (
    id SERIAL PRIMARY KEY,
    emp_code VARCHAR(50) NOT NULL,
    salary_bank VARCHAR(100),
    branch_name VARCHAR(100),
    account_no VARCHAR(50),
    salary_amount VARCHAR(50),
    salary_period VARCHAR(50),
    show_tax VARCHAR(10) DEFAULT 'Yes',
    sequence INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_bank_info_emp_code FOREIGN KEY (emp_code)
        REFERENCES employee_salary_information (emp_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_salary_bank_info_emp_code ON employee_salary_bank_info (emp_code);

CREATE TABLE IF NOT EXISTS employee_salary_breakdown (
    id SERIAL PRIMARY KEY,
    emp_code VARCHAR(50) NOT NULL,
    payroll_head VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    percentage_formula VARCHAR(255),
    base_head VARCHAR(100),
    amount VARCHAR(50),
    sequence INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_breakdown_emp_code FOREIGN KEY (emp_code)
        REFERENCES employee_salary_information (emp_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_salary_breakdown_emp_code ON employee_salary_breakdown (emp_code);

-- ----------------------------------------------------------------------------
-- auth_users
-- ----------------------------------------------------------------------------
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
);

CREATE INDEX IF NOT EXISTS idx_auth_users_employee_id ON auth_users (employee_id);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users (email);

-- ----------------------------------------------------------------------------
-- library_policies + library_policy_rules
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_policies (
    id SERIAL PRIMARY KEY,
    policy_code VARCHAR(50) NOT NULL UNIQUE,
    policy_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_library_policies_policy_code ON library_policies (policy_code);
CREATE INDEX IF NOT EXISTS idx_library_policies_category ON library_policies (category);
CREATE INDEX IF NOT EXISTS idx_library_policies_is_active ON library_policies (is_active);

CREATE TABLE IF NOT EXISTS library_policy_rules (
    id SERIAL PRIMARY KEY,
    policy_id INT NOT NULL,
    rule_code VARCHAR(50) NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    description TEXT,
    conditions JSON,
    calculation_formula VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_policy_rules_policy FOREIGN KEY (policy_id)
        REFERENCES library_policies (id) ON DELETE CASCADE,
    CONSTRAINT unique_policy_rule UNIQUE (policy_id, rule_code)
);

CREATE INDEX IF NOT EXISTS idx_library_policy_rules_rule_code ON library_policy_rules (rule_code);
CREATE INDEX IF NOT EXISTS idx_library_policy_rules_is_active ON library_policy_rules (is_active);

-- Insert default policies
INSERT INTO library_policies (policy_code, policy_name, description, category) VALUES
('OVERTIME', 'Overtime Policy', 'Rules for overtime calculations and eligibility', 'Compensation'),
('HOLIDAY_INCT', 'Holiday Incentive', 'Holiday work incentive rules', 'Compensation'),
('DUTY_ROSTER', 'Duty Roster Policy', 'Duty schedule and shift rules', 'Scheduling'),
('LEAVE', 'Leave Policy', 'Annual leave, sick leave, and other leave types', 'Leave Management'),
('MATERNITY', 'Maternity Leave Policy', 'Maternity leave rules and benefits', 'Leave Management'),
('ATTENDANCE_BONUS', 'Attendance Bonus Policy', 'Bonus for good attendance record', 'Compensation'),
('ABSENT_DEDUCT', 'Absent Deduction Policy', 'Salary deduction rules for absences', 'Deductions'),
('LATE_DEDUCT', 'Late Deduction Policy', 'Penalty rules for late attendance', 'Deductions'),
('BONUS', 'Bonus Policy', 'Year-end and performance bonus rules', 'Compensation'),
('TAX', 'Tax Policy', 'Tax calculation and deduction rules', 'Taxation'),
('SHIFT', 'Shift Policy', 'Shift differential and allowances', 'Compensation'),
('TIFFIN', 'Tiffin Bill Policy', 'Meal allowance and tiffin rules', 'Allowances'),
('ALLOWANCE', 'Allowance Policy', 'Various employee allowances', 'Allowances'),
('EARLY_OUT', 'Early Out Deduction Policy', 'Penalty for leaving early', 'Deductions'),
('SERVICE_BENEFIT', 'Service Benefit Policy', 'Benefits based on years of service', 'Benefits'),
('HD_DEDUCT', 'HD Deduct Rule', 'Half-day deduction calculation', 'Deductions');

-- Insert default rules for each policy
INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description)
SELECT
  id AS policy_id,
  'RULE_1' AS rule_code,
  'Rule 1' AS rule_name,
  'Standard rule - Default configuration' AS description
FROM library_policies;

INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description)
SELECT
  id AS policy_id,
  'RULE_2' AS rule_code,
  'Rule 2' AS rule_name,
  'Secondary rule - Alternative configuration' AS description
FROM library_policies;

INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description)
SELECT
  id AS policy_id,
  'RULE_3' AS rule_code,
  'Rule 3' AS rule_name,
  'Special case rule - Exception handling' AS description
FROM library_policies;

INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description)
SELECT
  id AS policy_id,
  'NA' AS rule_code,
  'N/A' AS rule_name,
  'Not Applicable - Policy does not apply' AS description
FROM library_policies;

-- ----------------------------------------------------------------------------
-- logs (attendance raw data) - also auto-created by the backend if missing
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- updated_at triggers (replicates MySQL's ON UPDATE CURRENT_TIMESTAMP)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'employees', 'attendance', 'employee_addresses', 'employee_education',
        'employee_policy_tagging', 'employee_salary_information',
        'employee_salary_bank_info', 'employee_salary_breakdown',
        'auth_users', 'library_policies', 'library_policy_rules'
      )
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'set_updated_at_' || t
        AND tgrelid = format('public.%I', t)::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
        t, t
      );
    END IF;
  END LOOP;
END
$$;
