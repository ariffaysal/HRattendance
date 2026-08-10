'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeAddressService } from '@/services/employee-address.service';
import { EmployeeAddress } from '@/types/employee-address';

export default function EmployeeAddressDetailPage() {
  const router = useRouter();
  const params = useParams();
  const empCode = params.empCode as string;
  
  const [record, setRecord] = useState<EmployeeAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (empCode) {
      loadAddressRecord();
    }
  }, [empCode]);

  async function loadAddressRecord() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeAddressService.getByEmpCode(empCode);
      setRecord(data);
    } catch (err: any) {
      console.error('Failed to load address record:', err);
      setError(err.message || 'Failed to load address record');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this address record?')) return;

    try {
      if (record && record.id) {
        await employeeAddressService.delete(record.id);
        router.push('/employee-address');
      }
    } catch (err: any) {
      console.error('Failed to delete address record:', err);
      alert('Failed to delete: ' + err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error || !record) {
    return (
      <div className="fade-in">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
            <h5>Error Loading Record</h5>
            <p className="text-muted">{error || 'Record not found'}</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/employee-address')}
            >
              <i className="fas fa-arrow-left me-2"></i> Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Address Details</h4>
          <p className="text-muted mb-0 small">
            Emp Code: {record.empCode}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link 
            href={`/employee-address/${record.id}`} 
            className="btn btn-primary"
          >
            <i className="fas fa-edit me-2"></i> Edit
          </Link>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
          >
            <i className="fas fa-trash me-2"></i> Delete
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => router.push('/employee-address')}
          >
            <i className="fas fa-arrow-left me-2"></i> Back
          </button>
        </div>
      </div>

      {/* Employee Information Card */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Employee Information</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label text-muted">Emp Code</label>
              <p className="fw-medium">{record.empCode}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Category</label>
              <p className="fw-medium">{record.category || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Company</label>
              <p className="fw-medium">{record.company || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Location</label>
              <p className="fw-medium">{record.location || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Division (Org)</label>
              <p className="fw-medium">{record.divisionOrg || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Department</label>
              <p className="fw-medium">{record.department || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Section</label>
              <p className="fw-medium">{record.section || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Subsection</label>
              <p className="fw-medium">{record.subsection || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Designation</label>
              <p className="fw-medium">{record.designation || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Present Address Card */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Present Address</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted">Village/Area</label>
              <p className="fw-medium">{record.presentVillageArea || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">House No</label>
              <p className="fw-medium">{record.presentHouseNo || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">Road No</label>
              <p className="fw-medium">{record.presentRoadNo || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">Post Office Code</label>
              <p className="fw-medium">{record.presentPostOfficeCode || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">Thana</label>
              <p className="fw-medium">{record.presentThana || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">District</label>
              <p className="fw-medium">{record.presentDistrict || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Division (Geo)</label>
              <p className="fw-medium">{record.presentDivisionGeo || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">Land Phone</label>
              <p className="fw-medium">{record.presentLandPhone || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">Cell Phone</label>
              <p className="fw-medium">{record.presentCellPhone || '-'}</p>
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted">Email</label>
              <p className="fw-medium">{record.presentEmail || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address Card */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            Permanent Address
            {record.isSameAsPresent && (
              <span className="badge bg-info ms-2">Same as Present</span>
            )}
          </h5>
        </div>
        <div className="card-body">
          {record.isSameAsPresent ? (
            <div className="text-center py-4">
              <i className="fas fa-check-circle text-info fa-2x mb-2"></i>
              <p className="text-muted mb-0">Permanent address is same as present address</p>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label text-muted">Village/Area</label>
                <p className="fw-medium">{record.permanentVillageArea || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">House No</label>
                <p className="fw-medium">{record.permanentHouseNo || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">Road No</label>
                <p className="fw-medium">{record.permanentRoadNo || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">Post Office Code</label>
                <p className="fw-medium">{record.permanentPostOfficeCode || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">Thana</label>
                <p className="fw-medium">{record.permanentThana || '-'}</p>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted">District</label>
                <p className="fw-medium">{record.permanentDistrict || '-'}</p>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted">Division (Geo)</label>
                <p className="fw-medium">{record.permanentDivisionGeo || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">Land Phone</label>
                <p className="fw-medium">{record.permanentLandPhone || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">Cell Phone</label>
                <p className="fw-medium">{record.permanentCellPhone || '-'}</p>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted">Email</label>
                <p className="fw-medium">{record.permanentEmail || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
