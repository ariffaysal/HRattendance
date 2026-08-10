-- Library: Policies Table
CREATE TABLE IF NOT EXISTS library_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_code VARCHAR(50) NOT NULL UNIQUE,
  policy_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_policy_code (policy_code),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Library: Policy Rules Table
CREATE TABLE IF NOT EXISTS library_policy_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES library_policies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_policy_rule (policy_id, rule_code),
  INDEX idx_rule_code (rule_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  id as policy_id,
  'RULE_1' as rule_code,
  'Rule 1' as rule_name,
  'Standard rule - Default configuration' as description
FROM library_policies;

INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description) 
SELECT 
  id as policy_id,
  'RULE_2' as rule_code,
  'Rule 2' as rule_name,
  'Secondary rule - Alternative configuration' as description
FROM library_policies;

INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description) 
SELECT 
  id as policy_id,
  'RULE_3' as rule_code,
  'Rule 3' as rule_name,
  'Special case rule - Exception handling' as description
FROM library_policies;

INSERT INTO library_policy_rules (policy_id, rule_code, rule_name, description) 
SELECT 
  id as policy_id,
  'NA' as rule_code,
  'N/A' as rule_name,
  'Not Applicable - Policy does not apply' as description
FROM library_policies;
