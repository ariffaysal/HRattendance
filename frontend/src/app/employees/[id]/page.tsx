'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { employeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee';

// Dropdown options
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female'];
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed'];
const CATEGORIES = ['Top Management', 'Management', 'Executive', 'Non-Management', 'Contractual', 'Staff'];
const COMPANIES = ['Skyview Online Ltd.', 'Greenmax Technologies Ltd.'];
const LOCATIONS = ['Head Office', 'Corporate Office', 'Branch Office'];
const DEPARTMENTS = ['Accounts & Billing', 'NOC', 'Sales & Marketing', 'Transmission', 'Legal', 'Call Center & Support', 'Maintenance', 'General Administration'];
const PROVISIONAL_TENORS = ['01 Month', '02 Month', '03 Month', '04 Month', '06 Month', '09 Month', '12 Month'];
const YES_NO = ['Yes', 'No'];

export default function EmployeeFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== 'new';
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateErrors, setDuplicateErrors] = useState<{national_id?: string; mobile_no?: string}>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('basic_info');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Employee>({
    mode: 'onChange'
  });

  useEffect(() => {
    if (isEdit) {
      loadEmployee();
    }
  }, []);

  // Intersection Observer for scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['basic_info', 'name_info', 'family_info', 'personal_info', 'employment_info'];
      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      if (current && current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // offset for sticky header if any
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  async function loadEmployee() {
    try {
      const data = await employeeService.getById(Number(params.id));
      setEmployee(data);
      reset(data);
    } catch (error) {
      console.error('Failed to load employee:', error);
      setError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  }


  const onSubmit = async (data: Employee, event?: any) => {
    if (event) {
      event.preventDefault();
    }
    
    setError(null);
    setDuplicateErrors({});
    setSuccess(null);
    setSaving(true);
    
    // Client-side validation for required fields
    const requiredFields = [
      'emp_code', 'emp_id', 'punch_card', 'full_name_bangla', 'full_name_english',
      'national_id', 'mobile_no', 'category', 'company', 'location', 'department',
      'designation', 'leave_app_process_use', 'leave_approving_authority',
      'joining_date', 'provisional_tenor'
    ];
    
    for (const field of requiredFields) {
      const value = data[field as keyof Employee];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        setError(`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
        setSaving(false);
        // Scroll to top to see error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    try {
      let result;
      if (isEdit) {
        const employeeId = Number(params.id);
        if (isNaN(employeeId)) {
          throw new Error('Invalid employee ID: ' + params.id);
        }
        result = await employeeService.update(employeeId, data);
        setSuccess('Employee updated successfully! Redirecting...');
      } else {
        result = await employeeService.create(data);
        setSuccess('Employee created successfully! Redirecting...');
      }
      
      setTimeout(() => {
        router.push('/employees');
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      
      if (errorMsg.includes('National ID already exists')) {
        setDuplicateErrors({ national_id: 'This National ID is already registered' });
      } else if (errorMsg.includes('Mobile No already exists')) {
        setDuplicateErrors({ mobile_no: 'This Mobile No is already registered' });
      } else {
        setError('Failed to save: ' + errorMsg);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-60">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-inputs">
      <div className="top-bar mb-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold">
            {isEdit ? 'Edit Employee Profile' : 'Add New Employee'}
          </h2>
          <p className="text-secondary mb-0">
            {isEdit ? 'Update the details for the employee below.' : 'Create a new employee profile in the system.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm border-0" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          <div>{error}</div>
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm border-0" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          <div>{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-container-split">
          
          {/* Navigation Sidebar */}
          <div className="form-sidebar">
            <h6 className="px-3 pt-2 pb-1 text-uppercase text-muted" style={{fontSize: '0.75rem', fontWeight: 700}}>Form Sections</h6>
            <button 
              type="button" 
              className={`form-nav-link ${activeSection === 'basic_info' ? 'active' : ''}`} 
              onClick={() => scrollToSection('basic_info')}
            >
              <i className="fas fa-id-badge" style={{width: '20px'}}></i> Basic Info
            </button>
            <button 
              type="button" 
              className={`form-nav-link ${activeSection === 'name_info' ? 'active' : ''}`} 
              onClick={() => scrollToSection('name_info')}
            >
              <i className="fas fa-user-circle" style={{width: '20px'}}></i> Name Info
            </button>
            <button 
              type="button" 
              className={`form-nav-link ${activeSection === 'family_info' ? 'active' : ''}`} 
              onClick={() => scrollToSection('family_info')}
            >
              <i className="fas fa-users" style={{width: '20px'}}></i> Family
            </button>
            <button 
              type="button" 
              className={`form-nav-link ${activeSection === 'personal_info' ? 'active' : ''}`} 
              onClick={() => scrollToSection('personal_info')}
            >
              <i className="fas fa-address-card" style={{width: '20px'}}></i> Personal Details
            </button>
            <button 
              type="button" 
              className={`form-nav-link ${activeSection === 'employment_info' ? 'active' : ''}`} 
              onClick={() => scrollToSection('employment_info')}
            >
              <i className="fas fa-briefcase" style={{width: '20px'}}></i> Employment
            </button>
          </div>

          {/* Form Content */}
          <div className="form-content-area">
            
            {/* Section 1: Basic Information */}
            <div id="basic_info" className="form-section">
              <h4 className="form-section-title">Basic Information</h4>
              <p className="form-section-desc">Core identifiers used for the system and external tracking devices.</p>
              
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label">Employee Code <span className="text-danger">*</span></label>
                  <input {...register('emp_code', { required: true })} className={`form-control ${errors.emp_code ? 'is-invalid border-danger' : ''}`} placeholder="e.g. EMP-001" />
                  {errors.emp_code && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Employee ID <span className="text-danger">*</span></label>
                  <input {...register('emp_id', { required: true })} className={`form-control ${errors.emp_id ? 'is-invalid border-danger' : ''}`} placeholder="Enter ID" />
                  {errors.emp_id && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Punch Card <span className="text-danger">*</span></label>
                  <input {...register('punch_card', { required: true })} className={`form-control ${errors.punch_card ? 'is-invalid border-danger' : ''}`} placeholder="Attendance card no" />
                  {errors.punch_card && <div className="invalid-feedback">Required</div>}
                </div>
              </div>
            </div>

            {/* Section 2: Name Information */}
            <div id="name_info" className="form-section">
              <h4 className="form-section-title">Name Information</h4>
              <p className="form-section-desc">Employee's official name in required languages.</p>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Full Name (English) <span className="text-danger">*</span></label>
                  <input {...register('full_name_english', { required: true })} className={`form-control ${errors.full_name_english ? 'is-invalid border-danger' : ''}`} placeholder="John Doe" />
                  {errors.full_name_english && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Full Name (Bangla) <span className="text-danger">*</span></label>
                  <input {...register('full_name_bangla', { required: true })} className={`form-control ${errors.full_name_bangla ? 'is-invalid border-danger' : ''}`} placeholder="জন ডোম" />
                  {errors.full_name_bangla && <div className="invalid-feedback">Required</div>}
                </div>
              </div>
            </div>

            {/* Section 3: Family Information */}
            <div id="family_info" className="form-section">
              <h4 className="form-section-title">Family Information</h4>
              <p className="form-section-desc">Details of immediate family members for emergency and record keeping.</p>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Father's Name (English)</label>
                  <input {...register('fathers_name')} className="form-control" placeholder="Enter father's name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Father's Name (Bangla)</label>
                  <input {...register('fathers_name_bangla')} className="form-control" placeholder="পিতার নাম" />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Mother's Name (English)</label>
                  <input {...register('mothers_name')} className="form-control" placeholder="Enter mother's name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mother's Name (Bangla)</label>
                  <input {...register('mothers_name_bangla')} className="form-control" placeholder="মাতার নাম" />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Spouse's Name (English)</label>
                  <input {...register('spouse_name')} className="form-control" placeholder="Enter spouse's name (if any)" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Spouse's Name (Bangla)</label>
                  <input {...register('spouse_name_bangla')} className="form-control" placeholder="স্বামীর/স্ত্রীর নাম" />
                </div>
              </div>
            </div>

            {/* Section 4: Personal Details */}
            <div id="personal_info" className="form-section">
              <h4 className="form-section-title">Personal Details</h4>
              <p className="form-section-desc">Key personal information including unique identification numbers.</p>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">National ID / Birth Reg. No. <span className="text-danger">*</span></label>
                  <input {...register('national_id', { required: true })} className={`form-control ${errors.national_id || duplicateErrors.national_id ? 'is-invalid border-danger' : ''}`} placeholder="Mandatory unique number" />
                  {errors.national_id && <div className="invalid-feedback">Required</div>}
                  {duplicateErrors.national_id && <div className="invalid-feedback">{duplicateErrors.national_id}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mobile No <span className="text-danger">*</span></label>
                  <input {...register('mobile_no', { required: true })} className={`form-control ${errors.mobile_no || duplicateErrors.mobile_no ? 'is-invalid border-danger' : ''}`} placeholder="Primary contact number" />
                  {errors.mobile_no && <div className="invalid-feedback">Required</div>}
                  {duplicateErrors.mobile_no && <div className="invalid-feedback">{duplicateErrors.mobile_no}</div>}
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" {...register('date_of_birth')} className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Age</label>
                  <input {...register('age')} className="form-control" placeholder="e.g. 30" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Gender</label>
                  <select {...register('gender')} className="form-select">
                    <option value="">Select Gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Blood Group</label>
                  <select {...register('blood_group')} className="form-select">
                    <option value="">Select Group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Marital Status</label>
                  <select {...register('marital_status')} className="form-select">
                    <option value="">Select Status</option>
                    {MARITAL_STATUS.map(ms => <option key={ms} value={ms}>{ms}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Religion</label>
                  <input {...register('religion')} className="form-control" placeholder="e.g. Islam, Hindu, etc." />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Nationality</label>
                  <input {...register('nationality')} className="form-control" defaultValue="Bangladeshi" />
                </div>
                <div className="col-12">
                  <label className="form-label">Birth Place</label>
                  <input {...register('birth_place')} className="form-control" placeholder="Town/District of birth" />
                </div>
              </div>
            </div>

            {/* Section 5: Employment Setup */}
            <div id="employment_info" className="form-section">
              <h4 className="form-section-title">Employment Setup</h4>
              <p className="form-section-desc">Departmental assignments, roles, and administrative hierarchies.</p>
              
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label">Category <span className="text-danger">*</span></label>
                  <select {...register('category', { required: true })} className={`form-select ${errors.category ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Company <span className="text-danger">*</span></label>
                  <select {...register('company', { required: true })} className={`form-select ${errors.company ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select Company</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.company && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Location <span className="text-danger">*</span></label>
                  <select {...register('location', { required: true })} className={`form-select ${errors.location ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select Location</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.location && <div className="invalid-feedback">Required</div>}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Department <span className="text-danger">*</span></label>
                  <select {...register('department', { required: true })} className={`form-select ${errors.department ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select Dept</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Division</label>
                  <select {...register('division')} className="form-select">
                    <option value="">Select Division</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Designation <span className="text-danger">*</span></label>
                  <input {...register('designation', { required: true })} className={`form-control ${errors.designation ? 'is-invalid border-danger' : ''}`} placeholder="Job Title" />
                  {errors.designation && <div className="invalid-feedback">Required</div>}
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
                <div className="col-md-6">
                  <label className="form-label">Designation Level</label>
                  <input {...register('designation_level')} className="form-control" placeholder="e.g. L1, L2..." />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Leave App. Process Use <span className="text-danger">*</span></label>
                  <select {...register('leave_app_process_use', { required: true })} className={`form-select ${errors.leave_app_process_use ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select</option>
                    {YES_NO.map(yn => <option key={yn} value={yn}>{yn}</option>)}
                  </select>
                  {errors.leave_app_process_use && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Leave Approving Authority <span className="text-danger">*</span></label>
                  <select {...register('leave_approving_authority', { required: true })} className={`form-select ${errors.leave_approving_authority ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select</option>
                    {YES_NO.map(yn => <option key={yn} value={yn}>{yn}</option>)}
                  </select>
                  {errors.leave_approving_authority && <div className="invalid-feedback">Required</div>}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Functional Superior</label>
                  <input {...register('functional_superior')} className="form-control" placeholder="Manager Name/ID" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Admin Superior</label>
                  <input {...register('admin_superior')} className="form-control" placeholder="Admin Name/ID" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Joining Date <span className="text-danger">*</span></label>
                  <input type="date" {...register('joining_date', { required: true })} className={`form-control ${errors.joining_date ? 'is-invalid border-danger' : ''}`} />
                  {errors.joining_date && <div className="invalid-feedback">Required</div>}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Provisional Tenor <span className="text-danger">*</span></label>
                  <select {...register('provisional_tenor', { required: true })} className={`form-select ${errors.provisional_tenor ? 'is-invalid border-danger' : ''}`}>
                    <option value="">Select Tenor</option>
                    {PROVISIONAL_TENORS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.provisional_tenor && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-md-8">
                  <label className="form-label">Remark</label>
                  <input {...register('remark')} className="form-control" placeholder="Any additional notes" />
                </div>
              </div>
            </div>

            {/* Action Bar inside Content Container (Sticky at bottom) */}
            <div className="form-floating-actions">
               <button type="button" className="btn btn-outline-secondary px-4 fw-medium" onClick={() => router.push('/employees')} disabled={saving}>
                 Cancel
               </button>
               <button type="submit" className="btn btn-primary px-5 fw-medium" disabled={saving}>
                 {saving ? (
                   <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                 ) : (
                   <><i className="fas fa-save me-2"></i> {isEdit ? 'Update Employee' : 'Create Employee'}</>
                 )}
               </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
