import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmployeePolicyTaggingService } from './employee-policy-tagging.service';
import { EmployeePolicyTaggingController } from './employee-policy-tagging.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeePolicyTaggingController],
  providers: [EmployeePolicyTaggingService],
})
export class EmployeePolicyTaggingModule {}
