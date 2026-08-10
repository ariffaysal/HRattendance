-- Employee Salary Information Tables (PostgreSQL)
CREATE TABLE IF NOT EXISTS employee_salary_information (
  id SERIAL PRIMARY KEY,
  emp_code VARCHAR(50) NOT NULL,
  emp_id VARCHAR(50) NULL,
  emp_name VARCHAR(100) NULL,
  category VARCHAR(100) NULL,
  company VARCHAR(100) NULL,
  location VARCHAR(100) NULL,
  division VARCHAR(100) NULL,
  department VARCHAR(100) NULL,
  section VARCHAR(100) NULL,
  subsection VARCHAR(100) NULL,
  designation VARCHAR(100) NULL,

  -- Salary Information Fields
  s_grade VARCHAR(50) NULL,
  st_salary VARCHAR(50) NULL,
  gross_salary VARCHAR(50) NULL,
  b_gross VARCHAR(50) NULL,
  cash_disbursement VARCHAR(10) DEFAULT 'No',
  policy VARCHAR(100) NULL,
  mode VARCHAR(50) DEFAULT 'Actual',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_salary_info_emp_code UNIQUE (emp_code)
);

CREATE INDEX IF NOT EXISTS idx_employee_salary_information_emp_code ON employee_salary_information (emp_code);

CREATE TABLE IF NOT EXISTS employee_salary_bank_info (
  id SERIAL PRIMARY KEY,
  emp_code VARCHAR(50) NOT NULL,
  salary_bank VARCHAR(100) NULL,
  branch_name VARCHAR(100) NULL,
  account_no VARCHAR(50) NULL,
  salary_amount VARCHAR(50) NULL,
  salary_period VARCHAR(50) NULL,
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
  percentage_formula VARCHAR(255) NULL,
  base_head VARCHAR(100) NULL,
  amount VARCHAR(50) NULL,
  sequence INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_salary_breakdown_emp_code FOREIGN KEY (emp_code)
      REFERENCES employee_salary_information (emp_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_salary_breakdown_emp_code ON employee_salary_breakdown (emp_code);
