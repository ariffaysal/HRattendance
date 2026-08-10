export interface BankInfo {
  id?: number;
  empCode?: string;
  salaryBank: string;
  branchName: string;
  accountNo: string;
  salaryAmount: string;
  salaryPeriod: string;
  showTax: string;
  sequence: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryBreakdown {
  id?: number;
  empCode?: string;
  payrollHead: string;
  type: string;
  percentageFormula: string;
  baseHead: string;
  amount: string;
  sequence: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSalaryInformation {
  id?: number;
  
  // Employee Details
  empCode: string;
  empId: string;
  empName: string;
  category: string;
  company: string;
  location: string;
  division: string;
  department: string;
  section: string;
  subsection: string;
  designation: string;
  
  // Salary Information
  sGrade: string;
  stSalary: string;
  grossSalary: string;
  bGross: string;
  cashDisbursement: string;
  policy: string;
  mode: string;
  
  // Bank Information
  bankInfos?: BankInfo[];
  
  // Salary Breakdown
  salaryBreakdown?: SalaryBreakdown[];
  
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEmployeeSalaryInformationData = Omit<EmployeeSalaryInformation, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeSalaryInformationData = Partial<CreateEmployeeSalaryInformationData>;
