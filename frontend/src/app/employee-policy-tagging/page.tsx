'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { employeePolicyTaggingService } from '@/services/employee-policy-tagging.service';

interface PolicyTagging {
  id: number;
  empCode: string;
  empId: string;
  empName: string;
  category: string;
  company: string;
  department: string;
  designation: string;
}

interface EmployeeGroup {
  empCode: string;
  empId: string;
  empName: string;
  department: string;
  designation: string;
  company: string;
  recordCount: number;
  firstRecordId?: number;
}

export default function EmployeePolicyTaggingDashboard() {
  const [records, setRecords] = useState<PolicyTagging[]>([]);
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
            company: record.company || '-',
            recordCount: 0,
            firstRecordId: record.id,
          };
        }
        groups[record.empCode].recordCount++;
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
      const data = await employeePolicyTaggingService.getAll(debouncedSearch);
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load policy tagging records:', err);
      setError(err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEmployee(empCode: string) {
    if (!confirm('Are you sure you want to delete the policy tagging record for this employee?')) return;

    try {
      const record = await employeePolicyTaggingService.getByEmpCode(empCode);
      if (record && record.id) {
        await employeePolicyTaggingService.delete(record.id);
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
          <p className="text-muted">Loading policy tagging records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Policy Tagging</h4>
          <p className="text-muted mb-0 small">Manage employee policy assignments</p>
        </div>
        <Link href="/employee-policy-tagging/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Assign Policies
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
                <th className="text-center">Policy Records</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-tags fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No policy tagging records found.</p>
                      <p className="small text-muted mt-2">Click "Assign Policies" to create one.</p>
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
                        {emp.recordCount}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link
                          href={`/employee-policy-tagging/emp/${emp.empCode}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View Policy Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteEmployee(emp.empCode)}
                          title="Delete Policy Record"
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
