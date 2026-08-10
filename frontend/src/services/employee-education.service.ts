import { api } from './api';
import { EmployeeEducation, CreateEmployeeEducationData, UpdateEmployeeEducationData } from '@/types/employee-education';

export const employeeEducationService = {
  async getAll(search?: string): Promise<EmployeeEducation[]> {
    const params = search ? { search } : {};
    const response = await api.get('/employee-education', { params });
    return response.data;
  },

  async getByEmpCode(empCode: string): Promise<EmployeeEducation[]> {
    const response = await api.get(`/employee-education/by-empcode/${empCode}`);
    return response.data;
  },

  async getById(id: number): Promise<EmployeeEducation> {
    const response = await api.get(`/employee-education/${id}`);
    return response.data;
  },

  async create(data: CreateEmployeeEducationData): Promise<EmployeeEducation> {
    const response = await api.post('/employee-education', data);
    return response.data;
  },

  async update(id: number, data: UpdateEmployeeEducationData): Promise<EmployeeEducation> {
    const response = await api.put(`/employee-education/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/employee-education/${id}`);
  },
};
