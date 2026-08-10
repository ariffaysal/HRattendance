import { api } from './api';
import { EmployeeAddress, CreateEmployeeAddressData, UpdateEmployeeAddressData } from '@/types/employee-address';

export const employeeAddressService = {
  async getAll(search?: string): Promise<EmployeeAddress[]> {
    const params = search ? { search } : {};
    const response = await api.get('/employee-addresses', { params });
    return response.data;
  },

  async getByEmpCode(empCode: string): Promise<EmployeeAddress> {
    const response = await api.get(`/employee-addresses/by-empcode/${empCode}`);
    return response.data;
  },

  async getById(id: number): Promise<EmployeeAddress> {
    const response = await api.get(`/employee-addresses/${id}`);
    return response.data;
  },

  async create(data: CreateEmployeeAddressData): Promise<EmployeeAddress> {
    const response = await api.post('/employee-addresses', data);
    return response.data;
  },

  async update(id: number, data: UpdateEmployeeAddressData): Promise<EmployeeAddress> {
    const response = await api.put(`/employee-addresses/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/employee-addresses/${id}`);
  },
};
