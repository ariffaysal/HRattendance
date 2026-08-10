'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeSalaryInformationService } from '@/services/employee-salary-information.service';
import { EmployeeSalaryInformation, BankInfo } from '@/types/employee-salary-information';

export default function EmployeeSalaryInformationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const empCode = params.empCode as string;
  
  const [record, setRecord] = useState<EmployeeSalaryInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (empCode) {
      loadSalaryRecord();
    }
  }, [empCode]);

  async function loadSalaryRecord() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeSalaryInformationService.getByEmpCode(empCode);
      setRecord(data);
    } catch (err: any) {
      console.error('Failed to load salary record:', err);
      setError(err.message || 'Failed to load salary information record');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this salary information record?')) return;

    try {
      if (record && record.id) {
        await employeeSalaryInformationService.delete(record.id);
        router.push('/employee-salary-information');
      }
    } catch (err: any) {
      console.error('Failed to delete salary record:', err);
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
              onClick={() => router.push('/employee-salary-information')}
            >
              <i className="fas fa-arrow-left me-2"></i> Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bankInfos = record.bankInfos || [];

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Salary Information Details</h4>
          <p className="text-muted mb-0 small">
            {record.empName} ({record.empCode})
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link 
            href={`/employee-salary-information/${record.id}`} 
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
            onClick={() => router.push('/employee-salary-information')}
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
              <label className="form-label text-muted">Emp ID</label>
              <p className="fw-medium">{record.empId || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Emp Name</label>
              <p className="fw-medium">{record.empName || '-'}</p>
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
              <label className="form-label text-muted">Division</label>
              <p className="fw-medium">{record.division || '-'}</p>
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

      {/* Salary Details Card */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Salary Details</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label text-muted">S Grade</label>
              <p className="fw-medium">{record.sGrade || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">ST Salary</label>
              <p className="fw-medium">{record.stSalary || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Gross Salary</label>
              <p className="fw-medium text-primary">{record.grossSalary || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">B Gross</label>
              <p className="fw-medium">{record.bGross || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Cash Disbursement</label>
              <p className="fw-medium">{record.cashDisbursement || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Policy</label>
              <p className="fw-medium">{record.policy || '-'}</p>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted">Mode</label>
              <p className="fw-medium">{record.mode || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Information Card */}
      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Bank Information ({bankInfos.length})</h5>
        </div>
        <div className="card-body p-0">
          {bankInfos.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-university fa-3x text-muted mb-3"></i>
              <p className="text-muted">No bank accounts configured for this employee.</p>
              <Link 
                href={`/employee-salary-information/${record.id}`} 
                className="btn btn-primary"
              >
                Add Bank Account
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bank Name</th>
                    <th>Branch</th>
                    <th>Account No</th>
                    <th>Salary Amount</th>
                    <th>Period</th>
                    <th>Show Tax</th>
                    <th>Sequence</th>
                  </tr>
                </thead>
                <tbody>
                  {bankInfos.map((bank: BankInfo, index: number) => (
                    <tr key={bank.id || index}>
                      <td className="fw-medium">{bank.salaryBank || '-'}</td>
                      <td>{bank.branchName || '-'}</td>
                      <td>{bank.accountNo || '-'}</td>
                      <td className="text-primary">{bank.salaryAmount || '-'}</td>
                      <td>{bank.salaryPeriod || '-'}</td>
                      <td>
                        <span className={`badge bg-${bank.showTax === 'Yes' ? 'success' : 'secondary'}`}>
                          {bank.showTax || 'No'}
                        </span>
                      </td>
                      <td>{bank.sequence || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
