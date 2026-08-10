'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { employeeEducationService } from '@/services/employee-education.service';
import { EmployeeEducation } from '@/types/employee-education';

interface EmployeeGroup {
  empCode: string;
  empName: string;
  empId: string;
  department: string;
  designation: string;
  company: string;
  educationCount: number;
  firstRecordId?: number;
}

export default function EmployeeEducationPage() {
  const [educations, setEducations] = useState<EmployeeEducation[]>([]);
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
    loadEducations();
  }, [debouncedSearch]);

  // Group educations by employee
  useEffect(() => {
    if (educations.length > 0) {
      const groups: Record<string, EmployeeGroup> = {};
      
      educations.forEach((edu) => {
        if (!groups[edu.empCode]) {
          groups[edu.empCode] = {
            empCode: edu.empCode,
            empName: edu.empName || '-',
            empId: edu.empId || '-',
            department: edu.department || '-',
            designation: edu.designation || '-',
            company: edu.company || '-',
            educationCount: 0,
            firstRecordId: edu.id,
          };
        }
        groups[edu.empCode].educationCount++;
      });
      
      setEmployeeGroups(Object.values(groups));
    } else {
      setEmployeeGroups([]);
    }
  }, [educations]);

  async function loadEducations() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeEducationService.getAll(debouncedSearch);
      setEducations(data);
    } catch (err: any) {
      console.error('Failed to load education records:', err);
      setError(err.message || 'Failed to load education records');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEmployee(empCode: string) {
    if (!confirm('Are you sure you want to delete all education records for this employee?')) return;

    try {
      const records = await employeeEducationService.getByEmpCode(empCode);
      for (const record of records) {
        if (record.id) {
          await employeeEducationService.delete(record.id);
        }
      }
      await loadEducations();
    } catch (err: any) {
      console.error('Failed to delete education records:', err);
      alert('Failed to delete education records: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3 spinner-lg" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading education records...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Education Information</h4>
          <p className="text-muted mb-0 small">Manage employee education records</p>
        </div>
        <Link href="/employee-education/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Add Education Record
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
                <th className="text-center">Education Records</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-graduation-cap fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No education records found.</p>
                      <p className="small text-muted mt-2">Click "Add Education Record" to create one.</p>
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
                    <td className="text-center">
                      <span className="badge bg-info fs-6">
                        {emp.educationCount}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link
                          href={`/employee-education/emp/${emp.empCode}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View All Education Records"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteEmployee(emp.empCode)}
                          title="Delete All Records for this Employee"
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
