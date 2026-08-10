export const EMPLOYEE_BASIC_FIELDS = [
  'emp_code', 'emp_id', 'punch_card'
];

export const EMPLOYEE_NAME_FIELDS = [
  'full_name_bangla', 'full_name_english'
];

export const EMPLOYEE_FAMILY_FIELDS = [
  'fathers_name_bangla', 'fathers_name', 'mothers_name_bangla', 'mothers_name',
  'spouse_name_bangla', 'spouse_name'
];

export const EMPLOYEE_PERSONAL_FIELDS = [
  'blood_group', 'gender', 'birth_place', 'date_of_birth', 'age',
  'religion', 'marital_status', 'nationality', 'national_id', 'mobile_no'
];

export const EMPLOYEE_JOB_FIELDS = [
  'category', 'company', 'location', 'division', 'department', 'section', 'subsection',
  'designation_level', 'designation',
  'functional_superior', 'leave_app_process_use', 'leave_approving_authority', 'admin_superior',
  'joining_date', 'provisional_tenor', 'remark'
];

export function getAllEmployeeFields(): string[] {
  return [
    ...EMPLOYEE_BASIC_FIELDS,
    ...EMPLOYEE_NAME_FIELDS,
    ...EMPLOYEE_FAMILY_FIELDS,
    ...EMPLOYEE_PERSONAL_FIELDS,
    ...EMPLOYEE_JOB_FIELDS
  ];
}
