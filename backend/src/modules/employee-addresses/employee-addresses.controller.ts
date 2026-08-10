import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { EmployeeAddressesService } from './employee-addresses.service';
import { CreateEmployeeAddressDto, UpdateEmployeeAddressDto } from './dto/create-employee-address.dto';

@Controller('employee-addresses')
export class EmployeeAddressesController {
  constructor(private readonly employeeAddressesService: EmployeeAddressesService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.employeeAddressesService.findAll(search);
  }

  @Get('by-empcode/:empCode')
  async findByEmpCode(@Param('empCode') empCode: string) {
    const address = await this.employeeAddressesService.findByEmpCode(empCode);
    if (!address) {
      throw new NotFoundException('Employee address not found');
    }
    return address;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeAddressesService.findOne(Number(id));
  }

  @Post()
  async create(@Body() dto: CreateEmployeeAddressDto) {
    return this.employeeAddressesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeAddressDto) {
    return this.employeeAddressesService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.employeeAddressesService.remove(Number(id));
    return { message: 'Employee address deleted successfully' };
  }
}
