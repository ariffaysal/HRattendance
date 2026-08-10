import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { EmployeeAddressesModule } from './modules/employee-addresses/employee-addresses.module';
import { EmployeeEducationModule } from './modules/employee-education/employee-education.module';
import { EmployeePolicyTaggingModule } from './modules/employee-policy-tagging/employee-policy-tagging.module';
import { EmployeeSalaryInformationModule } from './modules/employee-salary-information/employee-salary-information.module';
import { LibraryModule } from './modules/library/library.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AttendanceModule,
    EmployeesModule,
    EmployeeAddressesModule,
    EmployeeEducationModule,
    EmployeePolicyTaggingModule,
    EmployeeSalaryInformationModule,
    LibraryModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
