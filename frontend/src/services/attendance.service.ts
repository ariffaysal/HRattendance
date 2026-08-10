import { api } from './api';
import { AttendanceStats, PaginationData, JobCardEmployee, MonthlySegment } from '@/types/attendance';

export interface SearchParams {
  search?: string;
  searchType?: 'general' | 'emp_no' | 'acc_no';
  fromDate?: string;
  toDate?: string;
  page?: number;
}

export const attendanceService = {
  async checkCache(): Promise<boolean> {
    const response = await api.get('/attendance/cache-exists');
    return response.data.exists;
  },

  async uploadFile(file: File): Promise<{ success: boolean; message: string; records: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/attendance/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async clearData(): Promise<void> {
    await api.delete('/attendance/clear');
  },

  async getRecords(params: SearchParams): Promise<PaginationData<string[]>> {
    const response = await api.get('/attendance/records', { params });
    return response.data;
  },

  async getStats(params: SearchParams): Promise<AttendanceStats> {
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },

  async getJobCards(params: SearchParams): Promise<JobCardEmployee[]> {
    const response = await api.get('/attendance/job-cards', { params });
    return response.data;
  },

  async getMonthlyData(params: SearchParams): Promise<MonthlySegment[]> {
    const response = await api.get('/attendance/monthly', { params });
    return response.data;
  },
};
