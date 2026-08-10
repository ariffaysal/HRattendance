-- Library: Policies Table (PostgreSQL)
CREATE TABLE IF NOT EXISTS library_policies (
  id SERIAL PRIMARY KEY,
  policy_code VARCHAR(50) NOT NULL UNIQUE,
  policy_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_library_policies_policy_code ON library_policies (policy_code);
CREATE INDEX IF NOT EXISTS idx_library_policies_category ON library_policies (category);
CREATE INDEX IF NOT EXISTS idx_library_policies_is_active ON library_policies (is_active);

-- Library: Policy Rules Table
CREATE TABLE IF NOT EXISTS library_policy_rules (
  id SERIAL PRIMARY KEY,
  policy_id INT NOT NULL,
  rule_code VARCHAR(50) NOT NULL,
  rule_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  conditions JSON NULL,
  calculation_formula VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  effective_date DATE NULL,
  expiry_date DATE NULL,
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
