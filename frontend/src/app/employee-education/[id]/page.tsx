'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EmployeeEducation } from '@/types/employee-education';
import { employeeEducationService } from '@/services/employee-education.service';

// Dropdown options
const CATEGORIES = ['Top Management', 'Management', 'Executive', 'Non-Management', 'Contractual', 'Staff'];
const COMPANIES = ['Skyview Online Ltd.', 'Greenmax Technologies Ltd.'];
const LOCATIONS = ['Head Office', 'Corporate Office', 'Branch Office'];
const DEPARTMENTS = ['Accounts & Billing', 'NOC', 'Sales & Marketing', 'Transmission', 'Legal', 'Call Center & Support', 'Maintenance', 'General Administration'];
const EDUCATION_NATURES = ['Academic', 'Professional', 'Vocational', 'Technical', 'Other'];

interface EducationRow {
  id?: number;
  courseName: string;
  board: string;
  institution: string;
  discipline: string;
  majorSubject: string;
  year: string;
  result: string;
  educationNature: string;
}

interface FormData {
  empCode: string;
  empId: string;
  empName: string;
  category: string;
  company: string;
  location: string;
  division: string;
  department: string;
  section: string;
  subsection: string;
  designation: string;
  educationRows: EducationRow[];
};

export default function EmployeeEducationFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== 'new';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    empCode: '',
    empId: '',
    empName: '',
    category: '',
    company: '',
    location: '',
    division: '',
    department: '',
    section: '',
    subsection: '',
    designation: '',
    educationRows: [{
      courseName: '',
      board: '',
      institution: '',
      discipline: '',
      majorSubject: '',
      year: '',
      result: '',
      educationNature: 'Academic',
    }],
  });

  useEffect(() => {
    if (isEdit) {
      loadEmployeeEducation();
    }
  }, []);

  async function loadEmployeeEducation() {
    try {
      const data = await employeeEducationService.getById(Number(params.id));
      setFormData({
        empCode: data.empCode || '',
        empId: data.empId || '',
        empName: data.empName || '',
        category: data.category || '',
        company: data.company || '',
        location: data.location || '',
        division: data.division || '',
        department: data.department || '',
        section: data.section || '',
        subsection: data.subsection || '',
        designation: data.designation || '',
        educationRows: [{
          id: data.id,
          courseName: data.courseName || '',
          board: data.board || '',
          institution: data.institution || '',
          discipline: data.discipline || '',
          majorSubject: data.majorSubject || '',
          year: data.year || '',
          result: data.result || '',
          educationNature: data.educationNature || 'Academic',
        }],
      });
      setIsUpdateMode(true);
      setIsDeleteMode(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load employee education:', error);
      setError('Failed to load employee education data');
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index: number, field: keyof EducationRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      educationRows: prev.educationRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const addRow = () => {
    setFormData(prev => ({
      ...prev,
      educationRows: [
        ...prev.educationRows,
        {
          courseName: '',
          board: '',
          institution: '',
          discipline: '',
          majorSubject: '',
          year: '',
          result: '',
          educationNature: 'Academic',
        },
      ],
    }));
  };

  const removeRow = (index: number) => {
    if (formData.educationRows.length > 1) {
      setFormData(prev => ({
        ...prev,
        educationRows: prev.educationRows.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.empCode.trim()) {
      setError('Emp Code is required');
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      for (const row of formData.educationRows) {
        const data: EmployeeEducation = {
          empCode: formData.empCode,
          empId: formData.empId,
          empName: formData.empName,
          category: formData.category,
          company: formData.company,
          location: formData.location,
          division: formData.division,
          department: formData.department,
          section: formData.section,
          subsection: formData.subsection,
          designation: formData.designation,
          courseName: row.courseName,
          board: row.board,
          institution: row.institution,
          discipline: row.discipline,
          majorSubject: row.majorSubject,
          year: row.year,
          result: row.result,
          educationNature: row.educationNature,
        };
        await employeeEducationService.create(data);
      }
      setSuccess('Employee education records saved successfully!');
      setIsUpdateMode(true);
      setIsDeleteMode(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      setError('Failed to save: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEdit) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Update all education rows
      for (let i = 0; i < formData.educationRows.length; i++) {
        const row = formData.educationRows[i];
        const data: Partial<EmployeeEducation> = {
          empCode: formData.empCode,
          empId: formData.empId,
          empName: formData.empName,
          category: formData.category,
          company: formData.company,
          location: formData.location,
          division: formData.division,
          department: formData.department,
          section: formData.section,
          subsection: formData.subsection,
          designation: formData.designation,
          courseName: row.courseName,
          board: row.board,
          institution: row.institution,
          discipline: row.discipline,
          majorSubject: row.majorSubject,
          year: row.year,
          result: row.result,
          educationNature: row.educationNature,
        };
        
        if (row.id) {
          // Update existing record
          await employeeEducationService.update(row.id, data);
        } else {
          // Create new record for rows without ID
          await employeeEducationService.create(data as EmployeeEducation);
        }
      }
      setSuccess('Employee education records updated successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      setError('Failed to update: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm('Are you sure you want to delete this education record?')) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await employeeEducationService.delete(Number(params.id));
      setSuccess('Employee education record deleted successfully! Redirecting...');
      setTimeout(() => {
        router.push('/employee-education');
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      setError('Failed to delete: ' + errorMsg);
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    if (isEdit) {
      loadEmployeeEducation();
    } else {
      setFormData({
        empCode: '',
        empId: '',
        empName: '',
        category: '',
        company: '',
        location: '',
        division: '',
        department: '',
        section: '',
        subsection: '',
        designation: '',
        educationRows: [{
          courseName: '',
          board: '',
          institution: '',
          discipline: '',
          majorSubject: '',
          year: '',
          result: '',
          educationNature: 'Academic',
        }],
      });
    }
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4">
        <h4 className="mb-0 fw-bold">
          {isEdit ? 'Edit Employee Education Information' : 'Employee Education Information'}
        </h4>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
            </div>
          )}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}

          {/* Top Section: Employee Information */}
          <div className="mb-4">
            <h5 className="border-bottom pb-2 mb-3 text-primary">Employee Information</h5>
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Emp Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Browse or Write"
                  value={formData.empCode}
                  onChange={(e) => handleInputChange('empCode', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Emp ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Browse or Write"
                  value={formData.empId}
                  onChange={(e) => handleInputChange('empId', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Emp Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.empName}
                  onChange={(e) => handleInputChange('empName', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Company</label>
                <select
                  className="form-select"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                >
                  <option value="">Select</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Location</label>
                <select
                  className="form-select"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  <option value="">Select</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Division</label>
                <select
                  className="form-select"
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Section</label>
                <select
                  className="form-select"
                  value={formData.section}
                  onChange={(e) => handleInputChange('section', e.target.value)}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Subsection</label>
                <select
                  className="form-select"
                  value={formData.subsection}
                  onChange={(e) => handleInputChange('subsection', e.target.value)}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Designation</label>
                <select
                  className="form-select"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Middle Section: Education Details */}
          <div className="mb-4">
            <h5 className="border-bottom pb-2 mb-3 text-primary">Education Details</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
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
                    <th style={{ width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.educationRows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.courseName}
                          onChange={(e) => handleRowChange(index, 'courseName', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.board}
                          onChange={(e) => handleRowChange(index, 'board', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.institution}
                          onChange={(e) => handleRowChange(index, 'institution', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.discipline}
                          onChange={(e) => handleRowChange(index, 'discipline', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.majorSubject}
                          onChange={(e) => handleRowChange(index, 'majorSubject', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.year}
                          onChange={(e) => handleRowChange(index, 'year', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.result}
                          onChange={(e) => handleRowChange(index, 'result', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={row.educationNature}
                          onChange={(e) => handleRowChange(index, 'educationNature', e.target.value)}
                        >
                          {EDUCATION_NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-1"
                          onClick={addRow}
                          title="Add Row"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeRow(index)}
                          disabled={formData.educationRows.length === 1}
                          title="Remove Row"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: Command Buttons */}
          <div className="mt-4 d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleSave}
              disabled={saving || (isEdit ? true : false)}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-success px-4"
              onClick={handleUpdate}
              disabled={saving || !isUpdateMode}
            >
              {saving ? 'Updating...' : 'Update'}
            </button>
            <button
              type="button"
              className="btn btn-danger px-4"
              onClick={handleDelete}
              disabled={saving || !isDeleteMode}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              className="btn btn-info px-4 text-white"
              onClick={handleRefresh}
              disabled={saving}
            >
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => router.push('/employee-education')}
              disabled={saving}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
