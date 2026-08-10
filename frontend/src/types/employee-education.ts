export interface EmployeeEducation {
  id?: number;
  
  // Top Section - Employee Information
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
  
  // Middle Section - Education Details
  courseName: string;
  board: string;
  institution: string;
  discipline: string;
  majorSubject: string;
  year: string;
  result: string;
  educationNature: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEmployeeEducationData = Omit<EmployeeEducation, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeEducationData = Partial<CreateEmployeeEducationData>;
