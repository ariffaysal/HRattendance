'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { EmployeeAddress } from '@/types/employee-address';
import { employeeAddressService } from '@/services/employee-address.service';

// Dropdown options (same as employee form)
const CATEGORIES = ['Top Management', 'Management', 'Executive', 'Non-Management', 'Contractual', 'Staff'];
const COMPANIES = ['Skyview Online Ltd.', 'Greenmax Technologies Ltd.'];
const LOCATIONS = ['Head Office', 'Corporate Office', 'Branch Office'];
const DEPARTMENTS = ['Accounts & Billing', 'NOC', 'Sales & Marketing', 'Transmission', 'Legal', 'Call Center & Support', 'Maintenance', 'General Administration'];
const DIVISIONS_GEO = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

// Card Icons
const CARD_ICONS = {
  identification: 'fa-id-card',
  present: 'fa-map-marker-alt',
  permanent: 'fa-home',
};

export default function EmployeeAddressFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== 'new';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sameAsPresent, setSameAsPresent] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EmployeeAddress>({
    mode: 'onChange',
    defaultValues: {
      isSameAsPresent: false,
    }
  });

  // Watch present address fields for auto-fill when checkbox is checked
  const presentValues = watch([
    'presentVillageArea', 'presentHouseNo', 'presentRoadNo', 'presentPostOfficeCode',
    'presentThana', 'presentDistrict', 'presentDivisionGeo', 'presentLandPhone',
    'presentCellPhone', 'presentEmail'
  ]);

  // Auto-fill permanent address when checkbox is checked
  useEffect(() => {
    if (sameAsPresent) {
      setValue('permanentVillageArea', presentValues[0] || '');
      setValue('permanentHouseNo', presentValues[1] || '');
      setValue('permanentRoadNo', presentValues[2] || '');
      setValue('permanentPostOfficeCode', presentValues[3] || '');
      setValue('permanentThana', presentValues[4] || '');
      setValue('permanentDistrict', presentValues[5] || '');
      setValue('permanentDivisionGeo', presentValues[6] || '');
      setValue('permanentLandPhone', presentValues[7] || '');
      setValue('permanentCellPhone', presentValues[8] || '');
      setValue('permanentEmail', presentValues[9] || '');
    }
  }, [sameAsPresent, presentValues, setValue]);

  useEffect(() => {
    if (isEdit) {
      loadEmployeeAddress();
    }
  }, []);

  async function loadEmployeeAddress() {
    try {
      const data = await employeeAddressService.getById(Number(params.id));
      reset(data);
      setSameAsPresent(data.isSameAsPresent || false);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load employee address:', error);
      setError('Failed to load employee address data');
      setLoading(false);
    }
  }

  const onSubmit = async (data: EmployeeAddress, event?: any) => {
    if (event) {
      event.preventDefault();
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    // Add isSameAsPresent to the data
    const submitData = {
      ...data,
      isSameAsPresent: sameAsPresent
    };

    // Client-side validation for required fields
    const requiredFields = [
      'empCode', 'category', 'company', 'location', 'divisionOrg',
      'department', 'designation', 'presentVillageArea', 'presentThana',
      'presentDistrict', 'presentDivisionGeo'
    ];

    for (const field of requiredFields) {
      const value = submitData[field as keyof EmployeeAddress];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        setError(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        setSaving(false);
        return;
      }
    }

    try {
      let result;
      if (isEdit) {
        result = await employeeAddressService.update(Number(params.id), submitData);
        setSuccess('Employee address updated successfully! Redirecting...');
      } else {
        result = await employeeAddressService.create(submitData);
        setSuccess('Employee address created successfully! Redirecting...');
      }
      
      setTimeout(() => {
        router.push('/employee-address');
      }, 1500);
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      setError('Failed to save: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary">Loading employee address data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      {/* Header */}
      <div className="top-bar mb-4">
        <div>
          <h4 className="mb-0 fw-bold">
            <i className="fas fa-map-marked-alt me-2 text-primary"></i>
            {isEdit ? 'Edit Employee Address' : 'Add Employee Address'}
          </h4>
          <p className="mb-0 text-secondary mt-1">
            {isEdit ? 'Update employee address information' : 'Create a new employee address record'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button type="button" className="btn-close ms-auto" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4" role="alert">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="card form-main-card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} id="employee-address-form">
            {/* Card 1: Employee Identification */}
            <div className="form-card mb-4">
              <div className="form-card-header">
                <div className="form-card-header-icon">
                  <i className={`fas ${CARD_ICONS.identification}`}></i>
                </div>
                <div>
                  <h5 className="form-card-header-title">Employee Identification</h5>
                  <p className="form-card-header-subtitle">Employee details and organizational information</p>
                </div>
              </div>
              <div className="form-card-body">
                <div className="row g-4">
                  <div className="col-md-3">
                    <label className="form-label">Emp Code <span className="required">*</span></label>
                    <input 
                      {...register('empCode', { required: true })} 
                      className={`form-control ${errors.empCode ? 'is-invalid' : ''}`}
                      placeholder="Enter employee code"
                    />
                    {errors.empCode && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Emp Code is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Category <span className="required">*</span></label>
                    <select 
                      {...register('category', { required: true })} 
                      className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Category is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Company <span className="required">*</span></label>
                    <select 
                      {...register('company', { required: true })} 
                      className={`form-select ${errors.company ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Company</option>
                      {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.company && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Company is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Location <span className="required">*</span></label>
                    <select 
                      {...register('location', { required: true })} 
                      className={`form-select ${errors.location ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Location</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.location && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Location is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Division (Org) <span className="required">*</span></label>
                    <select 
                      {...register('divisionOrg', { required: true })} 
                      className={`form-select ${errors.divisionOrg ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Division</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.divisionOrg && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Division is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Department <span className="required">*</span></label>
                    <select 
                      {...register('department', { required: true })} 
                      className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Department is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Section</label>
                    <select {...register('section')} className="form-select">
                      <option value="">Select Section</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Subsection</label>
                    <select {...register('subsection')} className="form-select">
                      <option value="">Select Subsection</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Designation <span className="required">*</span></label>
                    <input 
                      {...register('designation', { required: true })} 
                      className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                      placeholder="Enter designation"
                    />
                    {errors.designation && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Designation is required</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Present Address */}
            <div className="form-card mb-4">
              <div className="form-card-header">
                <div className="form-card-header-icon">
                  <i className={`fas ${CARD_ICONS.present}`}></i>
                </div>
                <div>
                  <h5 className="form-card-header-title">Present Address</h5>
                  <p className="form-card-header-subtitle">Current residential address details</p>
                </div>
              </div>
              <div className="form-card-body">
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label">Village/Area <span className="required">*</span></label>
                    <input 
                      {...register('presentVillageArea', { required: true })} 
                      className={`form-control ${errors.presentVillageArea ? 'is-invalid' : ''}`}
                      placeholder="Enter village or area"
                    />
                    {errors.presentVillageArea && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Village/Area is required</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">House No</label>
                    <input {...register('presentHouseNo')} className="form-control" placeholder="Enter house number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Road No</label>
                    <input {...register('presentRoadNo')} className="form-control" placeholder="Enter road number" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Post Office Code</label>
                    <input {...register('presentPostOfficeCode')} className="form-control" placeholder="Enter postal code" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Thana <span className="required">*</span></label>
                    <input 
                      {...register('presentThana', { required: true })} 
                      className={`form-control ${errors.presentThana ? 'is-invalid' : ''}`}
                      placeholder="Enter thana"
                    />
                    {errors.presentThana && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Thana is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">District <span className="required">*</span></label>
                    <input 
                      {...register('presentDistrict', { required: true })} 
                      className={`form-control ${errors.presentDistrict ? 'is-invalid' : ''}`}
                      placeholder="Enter district"
                    />
                    {errors.presentDistrict && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> District is required</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Division (Geographic) <span className="required">*</span></label>
                    <select 
                      {...register('presentDivisionGeo', { required: true })} 
                      className={`form-select ${errors.presentDivisionGeo ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Division</option>
                      {DIVISIONS_GEO.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.presentDivisionGeo && <div className="invalid-feedback"><i className="fas fa-exclamation-circle"></i> Division is required</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Land Phone</label>
                    <input {...register('presentLandPhone')} className="form-control" placeholder="Enter land phone" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cell Phone</label>
                    <input {...register('presentCellPhone')} className="form-control" placeholder="Enter cell phone" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Email</label>
                    <input type="email" {...register('presentEmail')} className="form-control" placeholder="Enter email address" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Permanent Address */}
            <div className="form-card mb-4">
              <div className="form-card-header">
                <div className="form-card-header-icon">
                  <i className={`fas ${CARD_ICONS.permanent}`}></i>
                </div>
                <div>
                  <h5 className="form-card-header-title">Permanent Address</h5>
                  <p className="form-card-header-subtitle">Home town or permanent residence address</p>
                </div>
              </div>
              <div className="form-card-body">
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="sameAsPresent"
                      checked={sameAsPresent}
                      onChange={(e) => setSameAsPresent(e.target.checked)}
                    />
                    <label className="form-check-label fw-medium" htmlFor="sameAsPresent">
                      <i className="fas fa-copy me-1 text-primary"></i>
                      Same as Present Address
                    </label>
                  </div>
                </div>
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label">Village/Area</label>
                    <input 
                      {...register('permanentVillageArea')} 
                      className="form-control" 
                      placeholder="Enter village or area"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">House No</label>
                    <input 
                      {...register('permanentHouseNo')} 
                      className="form-control" 
                      placeholder="Enter house number"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Road No</label>
                    <input 
                      {...register('permanentRoadNo')} 
                      className="form-control" 
                      placeholder="Enter road number"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Post Office Code</label>
                    <input 
                      {...register('permanentPostOfficeCode')} 
                      className="form-control" 
                      placeholder="Enter postal code"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Thana</label>
                    <input 
                      {...register('permanentThana')} 
                      className="form-control" 
                      placeholder="Enter thana"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">District</label>
                    <input 
                      {...register('permanentDistrict')} 
                      className="form-control" 
                      placeholder="Enter district"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Division (Geographic)</label>
                    <select 
                      {...register('permanentDivisionGeo')} 
                      className="form-select"
                      disabled={sameAsPresent}
                    >
                      <option value="">Select Division</option>
                      {DIVISIONS_GEO.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Land Phone</label>
                    <input 
                      {...register('permanentLandPhone')} 
                      className="form-control" 
                      placeholder="Enter land phone"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cell Phone</label>
                    <input 
                      {...register('permanentCellPhone')} 
                      className="form-control" 
                      placeholder="Enter cell phone"
                      readOnly={sameAsPresent}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      {...register('permanentEmail')} 
                      className="form-control" 
                      placeholder="Enter email address"
                      readOnly={sameAsPresent}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 d-flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/employee-address')}>
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {isEdit ? 'Update Address' : 'Save Address'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
