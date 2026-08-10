import { api } from './api';

// Transform frontend form data to backend format
function transformToBackend(data: any) {
  const policies = data.policies || {};
  
  return {
    empCode: data.empCode,
    empId: data.empId,
    empName: data.empName,
    category: data.category,
    company: data.company,
    location: data.location,
    division: data.division,
    department: data.department,
    section: data.section,
    subsection: data.subsection,
    designation: data.designation,
    // Map policies to backend fields
    overtimePolicyRule: policies['Overtime Policy']?.ruleName,
    overtimePolicyDate: policies['Overtime Policy']?.effectiveDate,
    holidayIncentiveRule: policies['Holiday Incentive']?.ruleName,
    holidayIncentiveDate: policies['Holiday Incentive']?.effectiveDate,
    dutyRosterPolicyRule: policies['Duty Roster Policy']?.ruleName,
    dutyRosterPolicyDate: policies['Duty Roster Policy']?.effectiveDate,
    leavePolicyRule: policies['Leave Policy']?.ruleName,
    leavePolicyDate: policies['Leave Policy']?.effectiveDate,
    maternityLeavePolicyRule: policies['Maternity Leave Policy']?.ruleName,
    maternityLeavePolicyDate: policies['Maternity Leave Policy']?.effectiveDate,
    attendanceBonusPolicyRule: policies['Attendance Bonus Policy']?.ruleName,
    attendanceBonusPolicyDate: policies['Attendance Bonus Policy']?.effectiveDate,
    absentDeductionPolicyRule: policies['Absent Deduction Policy']?.ruleName,
    absentDeductionPolicyDate: policies['Absent Deduction Policy']?.effectiveDate,
    lateDeductionPolicyRule: policies['Late Deduction Policy']?.ruleName,
    lateDeductionPolicyDate: policies['Late Deduction Policy']?.effectiveDate,
    bonusPolicyRule: policies['Bonus Policy']?.ruleName,
    bonusPolicyDate: policies['Bonus Policy']?.effectiveDate,
    taxPolicyRule: policies['Tax Policy']?.ruleName,
    taxPolicyDate: policies['Tax Policy']?.effectiveDate,
    shiftPolicyRule: policies['Shift Policy']?.ruleName,
    shiftPolicyDate: policies['Shift Policy']?.effectiveDate,
    tiffinBillPolicyRule: policies['Tiffin Bill Policy']?.ruleName,
    tiffinBillPolicyDate: policies['Tiffin Bill Policy']?.effectiveDate,
    allowancePolicyRule: policies['Allowance Policy']?.ruleName,
    allowancePolicyDate: policies['Allowance Policy']?.effectiveDate,
    earlyOutDeductionPolicyRule: policies['Early Out Deduction Policy']?.ruleName,
    earlyOutDeductionPolicyDate: policies['Early Out Deduction Policy']?.effectiveDate,
    serviceBenefitPolicyRule: policies['Service Benefit Policy']?.ruleName,
    serviceBenefitPolicyDate: policies['Service Benefit Policy']?.effectiveDate,
    hdDeductRuleRule: policies['HD Deduct Rule']?.ruleName,
    hdDeductRuleDate: policies['HD Deduct Rule']?.effectiveDate,
  };
}

export const employeePolicyTaggingService = {
  async getAll(search?: string): Promise<any[]> {
    const params = search ? { search } : {};
    const response = await api.get('/employee-policy-tagging', { params });
    return response.data;
  },

  async getById(id: number): Promise<any> {
    const response = await api.get(`/employee-policy-tagging/${id}`);
    return response.data;
  },

  async getByEmpCode(empCode: string): Promise<any> {
    const response = await api.get(`/employee-policy-tagging/by-empcode/${empCode}`);
    return response.data;
  },

  async create(data: any): Promise<any> {
    const backendData = transformToBackend(data);
    const response = await api.post('/employee-policy-tagging', backendData);
    return response.data;
  },

  async update(id: number, data: any): Promise<any> {
    const backendData = transformToBackend(data);
    const response = await api.put(`/employee-policy-tagging/${id}`, backendData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/employee-policy-tagging/${id}`);
  },
};
