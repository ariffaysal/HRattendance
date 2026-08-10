'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { employeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadEmployees();
  }, [debouncedSearch]);

  async function loadEmployees() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeService.getAll(debouncedSearch);
      setEmployees(data);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeService.delete(id);
      await loadEmployees();
    } catch (err: any) {
      console.error('Failed to delete employee:', err);
      alert('Failed to delete employee: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employees</h4>
          <p className="text-muted mb-0 small">Manage employee records</p>
        </div>
        <Link href="/employees/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Add Employee
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, code, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Emp Code</th>
                <th>Company</th>
                <th>Department</th>
                <th>Designation</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-users fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No employees found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40 }}
                        >
                          <i className="fas fa-user text-muted"></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {emp.full_name_english}
                          </div>
                          <div className="small text-muted">
                            {emp.mobile_no || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-medium text-primary">#{emp.emp_code}</td>
                    <td>{emp.company || '-'}</td>
                    <td>{emp.department || '-'}</td>
                    <td>{emp.designation || '-'}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(emp.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
