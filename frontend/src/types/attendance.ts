export interface AttendanceStats {
  present: number;
  absent: number;
  total: number;
  fromDate?: string;
  toDate?: string;
}

export interface AttendanceRecord {
  status: string;
  empNo: string;
  acNo: string;
  no: string;
  name: string;
  date: string;
  clockIn: string;
  clockOut: string;
  late: string;
  early: string;
  workTime: string;
  department: string;
}

export interface PaginationData<T> {
  records: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export interface JobCardSummary {
  totalDays: number;
  weekend: number;
  workingDays: number;
  absent: number;
  present: number;
  late: number;
  earlyOut: number;
  payableDays: number;
}

export interface JobCardDailyRecord {
  date: string;
  day: string;
  inTime: string;
  outTime: string;
  late: string;
  status: string;
  isFriday: boolean;
  isPresent: boolean;
}

export interface JobCardEmployee {
  empId: string;
  name: string;
  empCode: string;
  idCard: string;
  dept: string;
  summary: JobCardSummary;
  records: JobCardDailyRecord[];
}

export interface MonthlyDailyRecord {
  day: number;
  status: string;
  in: string;
  out: string;
  ot: string;
  late: string;
}

export interface MonthlyEmployee {
  empId: string;
  name: string;
  no: string;
  records: MonthlyDailyRecord[];
  present: number;
  absent: number;
  late: number;
}

export interface MonthlySegment {
  year: number;
  month: string;
  ym: string;
  employees: MonthlyEmployee[];
}
