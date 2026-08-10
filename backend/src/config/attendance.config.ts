export const ATTENDANCE_COLUMNS = [
  'Emp No.', 'AC-No.', 'No.', 'Name', 'Auto-Assign', 'Date', 'Timetable',
  'On duty', 'Off duty', 'Clock In', 'Clock Out', 'Normal', 'Real time',
  'Late', 'Early', 'Absent', 'OT Time', 'Work Time', 'Exception',
  'Must C/In', 'Must C/Out', 'Department', 'NDays', 'WeekEnd',
  'Holiday', 'ATT_Time', 'NDays_OT', 'WeekEnd_OT', 'Holiday_OT'
] as const;

export const ATTENDANCE_INDEX = {
  STATUS: 0,
  EMP_NO: 1,
  AC_NO: 2,
  NO: 3,
  NAME: 4,
  DATE: 6,
  CLOCK_IN: 10,
  CLOCK_OUT: 11,
  LATE: 14,
  EARLY: 15,
  OT_TIME: 17,
  WORK_TIME: 18,
  DEPARTMENT: 22,
} as const;

export const DATE_FORMATS = [
  'Y-m-d',
  'n/j/Y',
  'd/m/Y',
  'm/d/Y',
  'd-m-Y',
  'n-j-Y'
];

export const VALID_VIEWS = ['landing', 'job_card', 'monthly', 'users'] as const;

export const RECORDS_PER_PAGE = 20;

export const CACHE_FILENAME = 'attendance_cache.csv';
