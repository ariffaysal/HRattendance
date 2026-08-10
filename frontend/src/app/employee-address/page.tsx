'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { employeeAddressService } from '@/services/employee-address.service';
import { EmployeeAddress } from '@/types/employee-address';

interface EmployeeGroup {
  empCode: string;
  company: string;
  department: string;
  presentDistrict: string;
  permanentDistrict: string;
  recordCount: number;
  firstRecordId?: number;
}

export default function EmployeeAddressPage() {
  const [addresses, setAddresses] = useState<EmployeeAddress[]>([]);
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
    loadAddresses();
  }, [debouncedSearch]);

  // Group addresses by employee
  useEffect(() => {
    if (addresses.length > 0) {
      const groups: Record<string, EmployeeGroup> = {};
      
      addresses.forEach((addr) => {
        if (!groups[addr.empCode]) {
          groups[addr.empCode] = {
            empCode: addr.empCode,
            company: addr.company || '-',
            department: addr.department || '-',
            presentDistrict: addr.presentDistrict || '-',
            permanentDistrict: addr.permanentDistrict || '-',
            recordCount: 0,
            firstRecordId: addr.id,
          };
        }
        groups[addr.empCode].recordCount++;
      });
      
      setEmployeeGroups(Object.values(groups));
    } else {
      setEmployeeGroups([]);
    }
  }, [addresses]);

  async function loadAddresses() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeAddressService.getAll(debouncedSearch);
      setAddresses(data);
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
      setError(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEmployee(empCode: string) {
    if (!confirm('Are you sure you want to delete the address record for this employee?')) return;

    try {
      const record = await employeeAddressService.getByEmpCode(empCode);
      if (record && record.id) {
        await employeeAddressService.delete(record.id);
        await loadAddresses();
      }
    } catch (err: any) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3 spinner-lg" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading addresses...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Address</h4>
          <p className="text-muted mb-0 small">Manage employee addresses</p>
        </div>
        <Link href="/employee-address/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Add  Employee Address
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
              placeholder="Search by emp code or district..."
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
                <th>Company</th>
                <th>Department</th>
                <th>Present District</th>
                <th>Permanent District</th>
                <th className="text-center">Address Records</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-map-marker-alt fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No employee addresses found.</p>
                      <p className="small text-muted mt-2">Click "Add Address" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employeeGroups.map((emp) => (
                  <tr key={emp.empCode}>
                    <td className="fw-medium text-primary">#{emp.empCode}</td>
                    <td>{emp.company}</td>
                    <td>{emp.department}</td>
                    <td>{emp.presentDistrict}</td>
                    <td>{emp.permanentDistrict}</td>
                    <td className="text-center">
                      <span className="badge bg-info fs-6">
                        {emp.recordCount}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link
                          href={`/employee-address/emp/${emp.empCode}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View Address Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteEmployee(emp.empCode)}
                          title="Delete Address Record"
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
