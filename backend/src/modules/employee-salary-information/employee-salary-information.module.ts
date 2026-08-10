import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmployeeSalaryInformationController } from './employee-salary-information.controller';
import { EmployeeSalaryInformationService } from './employee-salary-information.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeSalaryInformationController],
  providers: [EmployeeSalaryInformationService],
})
export class EmployeeSalaryInformationModule {}
