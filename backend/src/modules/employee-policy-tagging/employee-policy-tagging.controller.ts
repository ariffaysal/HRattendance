import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { EmployeePolicyTaggingService } from './employee-policy-tagging.service';
import { CreatePolicyTaggingDto, UpdatePolicyTaggingDto } from './dto/create-policy-tagging.dto';

@Controller('employee-policy-tagging')
export class EmployeePolicyTaggingController {
  constructor(private readonly employeePolicyTaggingService: EmployeePolicyTaggingService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.employeePolicyTaggingService.findAll(search);
  }

  @Get('by-empcode/:empCode')
  async findByEmpCode(@Param('empCode') empCode: string) {
    return this.employeePolicyTaggingService.findByEmpCode(empCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeePolicyTaggingService.findOne(Number(id));
  }

  @Post()
  async create(@Body() dto: CreatePolicyTaggingDto) {
    return this.employeePolicyTaggingService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePolicyTaggingDto) {
    return this.employeePolicyTaggingService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.employeePolicyTaggingService.remove(Number(id));
    return { message: 'Employee policy tagging deleted successfully' };
  }
}
