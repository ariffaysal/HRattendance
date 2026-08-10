export interface EmployeeAddress {
  id?: number;
  
  // Employee Identification
  empCode: string;
  category: string;
  company: string;
  location: string;
  divisionOrg: string;
  department: string;
  section: string;
  subsection: string;
  designation: string;
  
  // Present Address
  presentVillageArea: string;
  presentHouseNo: string;
  presentRoadNo: string;
  presentPostOfficeCode: string;
  presentThana: string;
  presentDistrict: string;
  presentDivisionGeo: string;
  presentLandPhone: string;
  presentCellPhone: string;
  presentEmail: string;
  
  // Permanent Address
  isSameAsPresent: boolean;
  permanentVillageArea: string;
  permanentHouseNo: string;
  permanentRoadNo: string;
  permanentPostOfficeCode: string;
  permanentThana: string;
  permanentDistrict: string;
  permanentDivisionGeo: string;
  permanentLandPhone: string;
  permanentCellPhone: string;
  permanentEmail: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEmployeeAddressData = Omit<EmployeeAddress, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeAddressData = Partial<CreateEmployeeAddressData>;
