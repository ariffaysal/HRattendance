import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { EmployeeAddressesModule } from './modules/employee-addresses/employee-addresses.module';
import { EmployeeEducationModule } from './modules/employee-education/employee-education.module';
import { EmployeePolicyTaggingModule } from './modules/employee-policy-tagging/employee-policy-tagging.module';
import { EmployeeSalaryInformationModule } from './modules/employee-salary-information/employee-salary-information.module';
import { LibraryModule } from './modules/library/library.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    DatabaseModule,
    AttendanceModule,
    EmployeesModule,
    EmployeeAddressesModule,
    EmployeeEducationModule,
    EmployeePolicyTaggingModule,
    EmployeeSalaryInformationModule,
    LibraryModule,
    AuthModule,
    HealthModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
