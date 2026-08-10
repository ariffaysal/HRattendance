import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEmployeeAddressDto {
  @IsString()
  empCode: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  divisionOrg?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  subsection?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  // Present Address
  @IsString()
  @IsOptional()
  presentVillageArea?: string;

  @IsString()
  @IsOptional()
  presentHouseNo?: string;

  @IsString()
  @IsOptional()
  presentRoadNo?: string;

  @IsString()
  @IsOptional()
  presentPostOfficeCode?: string;

  @IsString()
  @IsOptional()
  presentThana?: string;

  @IsString()
  @IsOptional()
  presentDistrict?: string;

  @IsString()
  @IsOptional()
  presentDivisionGeo?: string;

  @IsString()
  @IsOptional()
  presentLandPhone?: string;

  @IsString()
  @IsOptional()
  presentCellPhone?: string;

  @IsString()
  @IsOptional()
  presentEmail?: string;

  // Permanent Address
  @IsBoolean()
  @IsOptional()
  isSameAsPresent?: boolean;

  @IsString()
  @IsOptional()
  permanentVillageArea?: string;

  @IsString()
  @IsOptional()
  permanentHouseNo?: string;

  @IsString()
  @IsOptional()
  permanentRoadNo?: string;

  @IsString()
  @IsOptional()
  permanentPostOfficeCode?: string;

  @IsString()
  @IsOptional()
  permanentThana?: string;

  @IsString()
  @IsOptional()
  permanentDistrict?: string;

  @IsString()
  @IsOptional()
  permanentDivisionGeo?: string;

  @IsString()
  @IsOptional()
  permanentLandPhone?: string;

  @IsString()
  @IsOptional()
  permanentCellPhone?: string;

  @IsString()
  @IsOptional()
  permanentEmail?: string;
}

export class UpdateEmployeeAddressDto extends CreateEmployeeAddressDto {}
