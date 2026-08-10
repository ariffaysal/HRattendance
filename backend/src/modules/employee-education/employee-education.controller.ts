import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { EmployeeEducationService } from './employee-education.service';
import { CreateEmployeeEducationDto, UpdateEmployeeEducationDto } from './dto/create-employee-education.dto';

@Controller('employee-education')
export class EmployeeEducationController {
  constructor(private readonly employeeEducationService: EmployeeEducationService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.employeeEducationService.findAll(search);
  }

  @Get('by-empcode/:empCode')
  async findByEmpCode(@Param('empCode') empCode: string) {
    return this.employeeEducationService.findByEmpCode(empCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeEducationService.findOne(Number(id));
  }

  @Post()
  async create(@Body() dto: CreateEmployeeEducationDto) {
    return this.employeeEducationService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeEducationDto) {
    return this.employeeEducationService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.employeeEducationService.remove(Number(id));
    return { message: 'Employee education deleted successfully' };
  }
}
