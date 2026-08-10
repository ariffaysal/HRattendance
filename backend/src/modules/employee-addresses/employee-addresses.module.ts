import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmployeeAddressesController } from './employee-addresses.controller';
import { EmployeeAddressesService } from './employee-addresses.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeAddressesController],
  providers: [EmployeeAddressesService],
})
export class EmployeeAddressesModule {}
