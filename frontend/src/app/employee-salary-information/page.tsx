'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { employeeSalaryInformationService } from '@/services/employee-salary-information.service';
import { EmployeeSalaryInformation } from '@/types/employee-salary-information';

interface EmployeeGroup {
  empCode: string;
  empId: string;
  empName: string;
  department: string;
  designation: string;
  grossSalary: string;
  bankCount: number;
  firstRecordId?: number;
}

export default function EmployeeSalaryInformationDashboard() {
  const [records, setRecords] = useState<EmployeeSalaryInformation[]>([]);
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>([]);
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
    loadRecords();
  }, [debouncedSearch]);

  // Group records by employee
  useEffect(() => {
    if (records.length > 0) {
      const groups: Record<string, EmployeeGroup> = {};
      
      records.forEach((record) => {
        if (!groups[record.empCode]) {
          groups[record.empCode] = {
            empCode: record.empCode,
            empName: record.empName || '-',
            empId: record.empId || '-',
            department: record.department || '-',
            designation: record.designation || '-',
            grossSalary: record.grossSalary || '-',
            bankCount: record.bankInfos?.length || 0,
            firstRecordId: record.id,
          };
        }
      });
      
      setEmployeeGroups(Object.values(groups));
    } else {
      setEmployeeGroups([]);
    }
  }, [records]);

  async function loadRecords() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeSalaryInformationService.getAll(debouncedSearch);
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load salary information records:', err);
      setError(err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEmployee(empCode: string) {
    if (!confirm('Are you sure you want to delete the salary information record for this employee?')) return;

    try {
      const record = await employeeSalaryInformationService.getByEmpCode(empCode);
      if (record && record.id) {
        await employeeSalaryInformationService.delete(record.id);
        await loadRecords();
      }
    } catch (err: any) {
      console.error('Failed to delete record:', err);
      alert('Failed to delete: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading salary information records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Salary Information</h4>
          <p className="text-muted mb-0 small">Manage employee salary and bank details</p>
        </div>
        <Link href="/employee-salary-information/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Add Salary Record
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
              placeholder="Search by emp code, emp name, or department..."
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
                <th>Emp Code</th>
                <th>Emp ID</th>
                <th>Emp Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Gross Salary</th>
                <th className="text-center">Bank Accounts</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-money-bill-wave fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No salary information records found.</p>
                      <p className="small text-muted mt-2">Click "Add Salary Record" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employeeGroups.map((emp) => (
                  <tr key={emp.empCode}>
                    <td className="fw-medium text-primary">#{emp.empCode}</td>
                    <td>{emp.empId}</td>
                    <td>{emp.empName}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.grossSalary}</td>
                    <td className="text-center">
                      <span className="badge bg-info fs-6">
                        {emp.bankCount}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link
                          href={`/employee-salary-information/emp/${emp.empCode}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View Salary Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteEmployee(emp.empCode)}
                          title="Delete Salary Record"
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
