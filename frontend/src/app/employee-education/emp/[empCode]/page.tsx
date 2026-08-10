'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeEducationService } from '@/services/employee-education.service';
import { EmployeeEducation } from '@/types/employee-education';

export default function EmployeeEducationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const empCode = params.empCode as string;
  
  const [educations, setEducations] = useState<EmployeeEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (empCode) {
      loadEmployeeEducations();
    }
  }, [empCode]);

  async function loadEmployeeEducations() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeEducationService.getByEmpCode(empCode);
      setEducations(data);
    } catch (err: any) {
      console.error('Failed to load education records:', err);
      setError(err.message || 'Failed to load education records');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      await employeeEducationService.delete(id);
      await loadEmployeeEducations();
    } catch (err: any) {
      console.error('Failed to delete education record:', err);
      alert('Failed to delete: ' + err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  const employee = educations[0];

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Employee Education Details</h4>
          <p className="text-muted mb-0 small">
            {employee ? `${employee.empName} (${employee.empCode})` : empCode}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link 
            href={`/employee-education/new`} 
            className="btn btn-primary"
          >
            <i className="fas fa-plus me-2"></i> Add New
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => router.push('/employee-education')}
          >
            <i className="fas fa-arrow-left me-2"></i> Back to List
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {educations.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
            <h5>No Education Records Found</h5>
            <p className="text-muted">This employee has no education records yet.</p>
            <Link href={`/employee-education/new`} className="btn btn-primary">
              Add Education Record
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Employee Info Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Employee Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-2">
                  <label className="form-label text-muted">Emp Code</label>
                  <p className="fw-medium">{employee.empCode}</p>
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted">Emp ID</label>
                  <p className="fw-medium">{employee.empId || '-'}</p>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted">Emp Name</label>
                  <p className="fw-medium">{employee.empName || '-'}</p>
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted">Department</label>
                  <p className="fw-medium">{employee.department || '-'}</p>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted">Designation</label>
                  <p className="fw-medium">{employee.designation || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Education Records Table */}
          <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Education Records ({educations.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Course Name</th>
                      <th>Board</th>
                      <th>Institution</th>
                      <th>Discipline</th>
                      <th>Major Subject</th>
                      <th>Year</th>
                      <th>Result</th>
                      <th>Education Nature</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {educations.map((edu) => (
                      <tr key={edu.id}>
                        <td>{edu.courseName || '-'}</td>
                        <td>{edu.board || '-'}</td>
                        <td>{edu.institution || '-'}</td>
                        <td>{edu.discipline || '-'}</td>
                        <td>{edu.majorSubject || '-'}</td>
                        <td>{edu.year || '-'}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {edu.result || 'N/A'}
                          </span>
                        </td>
                        <td>{edu.educationNature || 'Academic'}</td>
                        <td className="text-end">
                          <div className="btn-group">
                            <Link
                              href={`/employee-education/${edu.id}`}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(edu.id!)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
