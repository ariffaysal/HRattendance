import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmployeeEducationController } from './employee-education.controller';
import { EmployeeEducationService } from './employee-education.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeEducationController],
  providers: [EmployeeEducationService],
})
export class EmployeeEducationModule {}
