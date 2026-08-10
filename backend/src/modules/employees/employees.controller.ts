import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees with optional search' })
  async getAll(@Query('search') search?: string) {
    return this.employeesService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new employee' })
  @ApiBody({ type: CreateEmployeeDto })
  async create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiBody({ type: UpdateEmployeeDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.delete(id);
  }
}
