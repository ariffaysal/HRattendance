-- PostgreSQL Database Setup for Attendance System
-- The recommended way to set up the database is Docker:
--   docker compose up -d
-- (the schema is created automatically from database/init-postgres.sql)
--
-- Manual setup with psql:
--   psql -U postgres -c "CREATE DATABASE attendance_db;"
--   psql -U postgres -d attendance_db -f database.sql

-- Create employees table
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

-- Create attendance table for monthly reports
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

-- Create employee_addresses table
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

-- Create logs table for CSV upload (attendance raw data)
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
