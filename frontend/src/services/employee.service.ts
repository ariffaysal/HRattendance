import { api } from './api';
import { Employee, CreateEmployeeData } from '@/types/employee';

export const employeeService = {
  async getAll(search?: string): Promise<Employee[]> {
    const response = await api.get('/employees', { params: { search } });
    return response.data;
  },

  async getById(id: number): Promise<Employee> {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async create(data: CreateEmployeeData): Promise<Employee> {
    const response = await api.post('/employees', data);
    return response.data;
  },

  async update(id: number, data: CreateEmployeeData): Promise<Employee> {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};
