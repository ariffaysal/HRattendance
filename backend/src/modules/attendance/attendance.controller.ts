import { Controller, Post, Get, Query, UseInterceptors, UploadedFile, Body, Delete, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttendanceService } from './attendance.service';
import { SearchAttendanceDto } from './dto/search-attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload attendance CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
      fileFilter: (req, file, callback) => {
        const allowed = ['.csv', '.txt', '.tsv'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Only .csv, .txt or .tsv files are allowed'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.attendanceService.processUpload(file);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all attendance data' })
  async clearData() {
    return this.attendanceService.clearData();
  }

  @Get('records')
  @ApiOperation({ summary: 'Get attendance records with search and filter' })
  async getRecords(@Query() query: SearchAttendanceDto) {
    return this.attendanceService.getRecords(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  async getStats(@Query() query: SearchAttendanceDto) {
    return this.attendanceService.getStats(query);
  }

  @Get('job-cards')
  @ApiOperation({ summary: 'Get job card data for all employees' })
  async getJobCards(@Query() query: SearchAttendanceDto) {
    return this.attendanceService.getJobCards(query);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly attendance data' })
  async getMonthly(@Query() query: SearchAttendanceDto) {
    return this.attendanceService.getMonthlyData(query);
  }

  @Get('cache-exists')
  @ApiOperation({ summary: 'Check if attendance cache exists' })
  async hasCache() {
    return { exists: this.attendanceService.hasCache() };
  }
}
