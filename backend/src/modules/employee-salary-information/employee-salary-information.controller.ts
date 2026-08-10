import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { EmployeeSalaryInformationService } from './employee-salary-information.service';
import { CreateEmployeeSalaryInformationDto, UpdateEmployeeSalaryInformationDto } from './dto/create-employee-salary-information.dto';

@Controller('employee-salary-information')
export class EmployeeSalaryInformationController {
  constructor(private readonly employeeSalaryInformationService: EmployeeSalaryInformationService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.employeeSalaryInformationService.findAll(search);
  }

  @Get('by-empcode/:empCode')
  async findByEmpCode(@Param('empCode') empCode: string) {
    return this.employeeSalaryInformationService.findByEmpCode(empCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeSalaryInformationService.findOne(Number(id));
  }

  @Post()
  async create(@Body() dto: CreateEmployeeSalaryInformationDto) {
    return this.employeeSalaryInformationService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeSalaryInformationDto) {
    return this.employeeSalaryInformationService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.employeeSalaryInformationService.remove(Number(id));
    return { message: 'Employee salary information deleted successfully' };
  }
}
