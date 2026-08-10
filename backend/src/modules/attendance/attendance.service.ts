import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import * as mysql from 'mysql2/promise';
import { SQL_CONNECTION } from '../../database/database.module';
import { ATTENDANCE_COLUMNS, ATTENDANCE_INDEX, CACHE_FILENAME } from '../../config/attendance.config';
import {
  AttendanceRecord,
  AttendanceStats,
  SearchParams,
  PaginationData,
  JobCardEmployee,
  JobCardDailyRecord,
  JobCardSummary,
  MonthlyEmployee,
} from './interfaces/attendance.interface';
import { SearchAttendanceDto } from './dto/search-attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly cachePath: string;

  constructor(
    @Inject(SQL_CONNECTION) private readonly db: mysql.Connection,
    private readonly configService: ConfigService,
  ) {
    this.cachePath = path.join(process.cwd(), CACHE_FILENAME);
  }

  hasCache(): boolean {
    return fs.existsSync(this.cachePath);
  }

  async processUpload(file: Express.Multer.File): Promise<{ success: boolean; message: string; records: number }> {
    await this.clearData();

    const delimiter = this.detectDelimiter(file.path);
    let rowCount = 0;
    const recordsToInsert: any[][] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv.parse({ headers: true, delimiter }))
        .on('error', reject)
        .on('data', (row) => {
          const extracted = this.extractValues(row);
          if (extracted[2]) { // If 'No.' exists
            const status = extracted[9] || extracted[10] ? 'Present' : 'Absent';
            recordsToInsert.push([status, ...extracted]);
            rowCount++;
          }
        })
        .on('end', async () => {
          try {
            // Batch insert in chunks to stay well below MySQL's placeholder limits
            const columns = ATTENDANCE_COLUMNS.map(c => `\`${c}\``).join(', ');
            const BATCH_SIZE = 200;
            const rows = recordsToInsert.map(record => record.slice(1));
            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
              const chunk = rows.slice(i, i + BATCH_SIZE);
              const placeholders = chunk
                .map(() => `(${ATTENDANCE_COLUMNS.map(() => '?').join(', ')})`)
                .join(', ');
              const sqlStr = `INSERT INTO logs (${columns}) VALUES ${placeholders}`;
              await this.db.execute(sqlStr, chunk.flat());
            }
            
            // Still write cache for backward compatibility with some potential legacy code, 
            // though we'll move away from it.
            this.writeCache(recordsToInsert);
            
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            resolve({ success: true, message: `SUCCESS! ${rowCount} rows imported.`, records: rowCount });
          } catch (err) {
            reject(err);
          }
        });
    });
  }

  async clearData(): Promise<void> {
    await this.db.execute('TRUNCATE TABLE logs');
    if (fs.existsSync(this.cachePath)) {
      fs.unlinkSync(this.cachePath);
    }
  }

  async getRecords(dto: SearchAttendanceDto): Promise<PaginationData<string[]>> {
    const perPage = 20;
    const { where, params } = this.buildFilterQuery(dto);

    const [countRows] = await this.db.execute(
      `SELECT COUNT(*) AS total FROM logs WHERE 1=1 ${where}`,
      params,
    );
    const total = Number((countRows as any[])[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(Math.max(1, dto.page || 1), totalPages);
    const offset = (currentPage - 1) * perPage;

    const [rows] = await this.db.execute(
      `SELECT * FROM logs WHERE 1=1 ${where} ORDER BY \`Date\` DESC, \`No.\` ASC LIMIT ? OFFSET ?`,
      [...params, perPage, offset],
    );

    return {
      records: (rows as any[]).map(row => this.mapRow(row)),
      total,
      currentPage,
      totalPages,
      perPage,
    };
  }

  async getStats(dto: SearchAttendanceDto): Promise<AttendanceStats & { total: number; fromDate?: string; toDate?: string }> {
    const records = await this.loadAndFilterRecords(dto);
    const present = records.filter(r => r[0] === 'Present').length;
    const absent = records.filter(r => r[0] === 'Absent').length;

    return {
      present,
      absent,
      total: records.length,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    };
  }

  async getJobCards(dto: SearchAttendanceDto): Promise<JobCardEmployee[]> {
    const records = await this.loadAndFilterRecords(dto);
    const grouped = this.groupByEmployee(records);

    return Object.entries(grouped).map(([empId, group]) => {
      const summary = this.calculateJobCardSummary(group.records, dto.fromDate, dto.toDate);
      const dailyRecords = this.buildDailyRecords(group.records, dto.fromDate, dto.toDate);

      return {
        empId,
        name: group.name,
        empCode: group.empCode,
        idCard: group.idCard,
        dept: group.dept,
        summary,
        records: dailyRecords,
      };
    });
  }

  async getMonthlyData(dto: SearchAttendanceDto): Promise<{ year: number; month: string; ym: string; employees: MonthlyEmployee[] }[]> {
    const records = await this.loadAndFilterRecords(dto);
    const grouped = this.groupByEmployee(records);

    const segments = this.getMonthSegments(dto.fromDate, dto.toDate);

    return segments.map(segment => {
      const employees: MonthlyEmployee[] = [];

      Object.entries(grouped).forEach(([empId, group]) => {
        const filtered = group.records.filter(r => {
          const date = this.parseDate(r[ATTENDANCE_INDEX.DATE]);
          return date && date.startsWith(segment.ym);
        });

        if (filtered.length > 0) {
          const daysData = this.buildMonthlyDaysData(filtered, segment.ym);
          const totals = this.calculateMonthlyTotals(daysData);

          employees.push({
            empId,
            name: group.name,
            no: group.empCode,
            records: daysData,
            present: totals.present,
            absent: totals.absent,
            late: totals.late,
          });
        }
      });

      return { ...segment, employees };
    });
  }

  private detectDelimiter(filePath: string): string {
    const content = fs.readFileSync(filePath, 'utf8');
    const firstLine = content.split('\n')[0];
    return firstLine.includes('\t') ? '\t' : ',';
  }

  private extractValues(row: any): string[] {
    return ATTENDANCE_COLUMNS.map(col => {
      const val = row[col]?.trim() || '';
      return val === '' ? null : val;
    });
  }

  private writeCache(records: any[]): void {
    const ws = fs.createWriteStream(this.cachePath);
    csv.writeToStream(ws, records, { headers: ['Status', ...ATTENDANCE_COLUMNS] });
  }

  private buildFilterQuery(dto: SearchAttendanceDto): { where: string; params: any[] } {
    const searchTerms = dto.search ? dto.search.split(',').map(s => s.trim()).filter(s => s) : [];
    let where = '';
    const params: any[] = [];

    if (searchTerms.length > 0) {
      const searchConditions: string[] = [];
      for (const term of searchTerms) {
        switch (dto.searchType) {
          case 'general':
            searchConditions.push('(`Name` LIKE ? OR `No.` = ?)');
            params.push(`%${term}%`, term);
            break;
          case 'emp_no':
            searchConditions.push('`Emp No.` = ?');
            params.push(term);
            break;
          case 'acc_no':
            searchConditions.push('`AC-No.` = ?');
            params.push(term);
            break;
        }
      }
      if (searchConditions.length > 0) {
        where += ` AND (${searchConditions.join(' OR ')})`;
      }
    }

    if (dto.fromDate && dto.toDate) {
      where += ' AND `Date` >= ? AND `Date` <= ?';
      params.push(dto.fromDate, dto.toDate);
    }

    return { where, params };
  }

  // Map a database row back to the string[] format expected by the rest of the application.
  // Index 0 is the computed Status (based on Clock In/Clock Out), followed by ATTENDANCE_COLUMNS values.
  private mapRow(row: any): string[] {
    const hasClockIn = row['Clock In'] && row['Clock In'] !== '00:00';
    const hasClockOut = row['Clock Out'] && row['Clock Out'] !== '00:00';
    const status = (hasClockIn || hasClockOut) ? 'Present' : 'Absent';

    return [status, ...ATTENDANCE_COLUMNS.map(col => {
      const val = row[col];
      return val === null || val === undefined ? '' : String(val);
    })];
  }

  private async loadAndFilterRecords(dto: SearchAttendanceDto): Promise<string[][]> {
    const { where, params } = this.buildFilterQuery(dto);

    try {
      const [rows] = await this.db.execute(
        `SELECT * FROM logs WHERE 1=1 ${where} ORDER BY \`Date\` DESC, \`No.\` ASC`,
        params,
      );
      return (rows as any[]).map(row => this.mapRow(row));
    } catch (err) {
      console.error('Database query failed, falling back to CSV if available:', err.message);
      if (fs.existsSync(this.cachePath)) {
        // Legacy fallback - we aim for DB first
        return this.loadAndFilterRecordsFromCsv(dto);
      }
      return [];
    }
  }

  private async loadAndFilterRecordsFromCsv(dto: SearchAttendanceDto): Promise<string[][]> {
    const searchTerms = dto.search ? dto.search.split(',').map(s => s.trim()).filter(s => s) : [];
    const records: string[][] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.cachePath)
        .pipe(csv.parse({ headers: false, skipRows: 1 }))
        .on('error', reject)
        .on('data', (row: string[]) => {
          if (this.matchesSearch(row, searchTerms, dto.searchType) &&
              this.matchesDateRange(row, dto.fromDate, dto.toDate)) {
            records.push(row);
          }
        })
        .on('end', () => resolve(records));
    });
  }

  private matchesSearch(row: string[], searchTerms: string[], searchType: string): boolean {
    if (searchTerms.length === 0) return true;

    for (const term of searchTerms) {
      switch (searchType) {
        case 'general':
          if (row[ATTENDANCE_INDEX.NAME]?.toLowerCase().includes(term.toLowerCase()) ||
              row[ATTENDANCE_INDEX.NO]?.includes(term)) {
            return true;
          }
          break;
        case 'emp_no':
          if (row[ATTENDANCE_INDEX.EMP_NO] === term) return true;
          break;
        case 'acc_no':
          if (row[ATTENDANCE_INDEX.AC_NO] === term) return true;
          break;
      }
    }
    return false;
  }

  private matchesDateRange(row: string[], fromDate?: string, toDate?: string): boolean {
    if (!fromDate || !toDate) return true;

    const recordDate = this.parseDate(row[ATTENDANCE_INDEX.DATE]);
    if (!recordDate) return true;

    return recordDate >= fromDate && recordDate <= toDate;
  }

  private parseDate(dateStr: string): string | null {
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
    ];

    for (const format of formats) {
      if (format.test(dateStr)) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
    }
    return null;
  }

  private groupByEmployee(records: string[][]): Record<string, { name: string; empCode: string; idCard: string; dept: string; records: string[][] }> {
    const groups: Record<string, any> = {};

    for (const rec of records) {
      const empId = rec[ATTENDANCE_INDEX.NO];
      if (!groups[empId]) {
        groups[empId] = {
          name: rec[ATTENDANCE_INDEX.NAME],
          empCode: rec[ATTENDANCE_INDEX.NO],
          idCard: rec[ATTENDANCE_INDEX.AC_NO],
          dept: rec[ATTENDANCE_INDEX.DEPARTMENT] || '-',
          records: [],
        };
      }
      groups[empId].records.push(rec);
    }

    return groups;
  }

  private calculateJobCardSummary(records: string[][], fromDate?: string, toDate?: string): JobCardSummary {
    const dates = records.map(r => this.parseDate(r[ATTENDANCE_INDEX.DATE])).filter(d => d) as string[];
    const calcFrom = fromDate || (dates.length > 0 ? dates.reduce((a, b) => a < b ? a : b) : new Date().toISOString().split('T')[0]);
    const calcTo = toDate || (dates.length > 0 ? dates.reduce((a, b) => a > b ? a : b) : new Date().toISOString().split('T')[0]);

    const start = new Date(calcFrom);
    const end = new Date(calcTo);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const dateIndex: Record<string, string[]> = {};
    for (const rec of records) {
      const date = this.parseDate(rec[ATTENDANCE_INDEX.DATE]);
      if (date) dateIndex[date] = rec;
    }

    let weekend = 0, workingDays = 0, absent = 0, present = 0, late = 0, earlyOut = 0;

    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      const isFriday = dayOfWeek === 5;

      if (dateIndex[dateKey]) {
        const rec = dateIndex[dateKey];
        const isPresent = rec[0] === 'Present';

        if (isFriday) {
          weekend++;
          if (isPresent) present++;
        } else {
          workingDays++;
          if (isPresent) {
            present++;
            if (rec[ATTENDANCE_INDEX.LATE] && rec[ATTENDANCE_INDEX.LATE] !== '00:00') late++;
            if (rec[ATTENDANCE_INDEX.EARLY] && rec[ATTENDANCE_INDEX.EARLY] !== '00:00') earlyOut++;
          } else {
            absent++;
          }
        }
      } else if (isFriday) {
        weekend++;
      } else {
        absent++;
        workingDays++;
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      totalDays,
      weekend,
      workingDays,
      absent,
      present,
      late,
      earlyOut,
      payableDays: totalDays - absent,
    };
  }

  private buildDailyRecords(records: string[][], fromDate?: string, toDate?: string): JobCardDailyRecord[] {
    const dates = records.map(r => this.parseDate(r[ATTENDANCE_INDEX.DATE])).filter(d => d) as string[];
    const calcFrom = fromDate || (dates.length > 0 ? dates.reduce((a, b) => a < b ? a : b) : new Date().toISOString().split('T')[0]);
    const calcTo = toDate || (dates.length > 0 ? dates.reduce((a, b) => a > b ? a : b) : new Date().toISOString().split('T')[0]);

    const dateIndex: Record<string, string[]> = {};
    for (const rec of records) {
      const date = this.parseDate(rec[ATTENDANCE_INDEX.DATE]);
      if (date) dateIndex[date] = rec;
    }

    const dailyRecords: JobCardDailyRecord[] = [];
    const start = new Date(calcFrom);
    const end = new Date(calcTo);
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      const dayName = current.toLocaleDateString('en', { weekday: 'short' });
      const isFriday = current.getDay() === 5;
      const hasRecord = dateIndex[dateKey];

      if (hasRecord) {
        const rec = dateIndex[dateKey];
        const isPresent = rec[0] === 'Present';
        dailyRecords.push({
          date: dateKey,
          day: isFriday && !isPresent ? 'Fri (Off)' : dayName,
          inTime: rec[ATTENDANCE_INDEX.CLOCK_IN] || '-',
          outTime: rec[ATTENDANCE_INDEX.CLOCK_OUT] || '-',
          late: rec[ATTENDANCE_INDEX.LATE] || '-',
          status: rec[0],
          isFriday,
          isPresent,
        });
      } else if (isFriday) {
        dailyRecords.push({
          date: dateKey,
          day: 'Fri (Off)',
          inTime: '-',
          outTime: '-',
          late: '-',
          status: 'OFF',
          isFriday: true,
          isPresent: false,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return dailyRecords;
  }

  private getMonthSegments(fromDate?: string, toDate?: string): { year: number; month: string; ym: string }[] {
    const now = new Date();
    const start = fromDate ? new Date(fromDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = toDate ? new Date(toDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const segments: { year: number; month: string; ym: string }[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      segments.push({
        year: current.getFullYear(),
        month: current.toLocaleDateString('en', { month: 'long' }),
        ym: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return segments;
  }

  private buildMonthlyDaysData(records: string[][], ym: string): any[] {
    const year = parseInt(ym.split('-')[0]);
    const month = parseInt(ym.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();

    const daysData: any[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      daysData.push({ day: d, status: '-', in: '00:00', out: '00:00', ot: '0', late: '0' });
    }

    for (const rec of records) {
      const dateStr = this.parseDate(rec[ATTENDANCE_INDEX.DATE]);
      if (!dateStr || !dateStr.startsWith(ym)) continue;

      const day = parseInt(dateStr.split('-')[2]);
      const isPresent = rec[0] === 'Present';
      const isLate = rec[ATTENDANCE_INDEX.LATE] && rec[ATTENDANCE_INDEX.LATE] !== '00:00';

      daysData[day - 1] = {
        day,
        status: isPresent ? 'P' : 'A',
        in: rec[ATTENDANCE_INDEX.CLOCK_IN] ? this.formatTime(rec[ATTENDANCE_INDEX.CLOCK_IN]) : '00:00',
        out: rec[ATTENDANCE_INDEX.CLOCK_OUT] ? this.formatTime(rec[ATTENDANCE_INDEX.CLOCK_OUT]) : '00:00',
        ot: rec[ATTENDANCE_INDEX.OT_TIME] || '0',
        late: isLate ? '1' : '0',
      };
    }

    return daysData;
  }

  private formatTime(timeStr: string): string {
    if (!timeStr || timeStr === '00:00') return '00:00';
    try {
      const d = new Date(`2000-01-01T${timeStr}`);
      return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return timeStr;
    }
  }

  private calculateMonthlyTotals(daysData: any[]): { present: number; absent: number; late: number } {
    let present = 0, absent = 0, late = 0;
    for (const dd of daysData) {
      if (dd.status === 'P') present++;
      if (dd.status === 'A') absent++;
      if (dd.late === '1') late++;
    }
    return { present, absent, late };
  }
}
