'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { employeePolicyTaggingService } from '@/services/employee-policy-tagging.service';
import { libraryService, Policy } from '@/services/library.service';

// Dropdown options
const CATEGORIES = ['Top Management', 'Management', 'Executive', 'Non-Management', 'Contractual', 'Staff'];
const COMPANIES = ['Skyview Online Ltd.', 'Greenmax Technologies Ltd.'];
const LOCATIONS = ['Head Office', 'Corporate Office', 'Branch Office'];
const DEPARTMENTS = ['Accounts & Billing', 'NOC', 'Sales & Marketing', 'Transmission', 'Legal', 'Call Center & Support', 'Maintenance', 'General Administration'];
interface PolicyFormData {
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
  policies: {
    [key: string]: {
      ruleName: string;
      effectiveDate: string;
    };
  };
}

// Transform backend data to frontend format
function transformFromBackend(data: any, availablePolicies: Policy[]): PolicyFormData {
  const policyMapping: { [key: string]: [string, string] } = {
    'Overtime Policy': ['overtimePolicyRule', 'overtimePolicyDate'],
    'Holiday Incentive': ['holidayIncentiveRule', 'holidayIncentiveDate'],
    'Duty Roster Policy': ['dutyRosterPolicyRule', 'dutyRosterPolicyDate'],
    'Leave Policy': ['leavePolicyRule', 'leavePolicyDate'],
    'Maternity Leave Policy': ['maternityLeavePolicyRule', 'maternityLeavePolicyDate'],
    'Attendance Bonus Policy': ['attendanceBonusPolicyRule', 'attendanceBonusPolicyDate'],
    'Absent Deduction Policy': ['absentDeductionPolicyRule', 'absentDeductionPolicyDate'],
    'Late Deduction Policy': ['lateDeductionPolicyRule', 'lateDeductionPolicyDate'],
    'Bonus Policy': ['bonusPolicyRule', 'bonusPolicyDate'],
    'Tax Policy': ['taxPolicyRule', 'taxPolicyDate'],
    'Shift Policy': ['shiftPolicyRule', 'shiftPolicyDate'],
    'Tiffin Bill Policy': ['tiffinBillPolicyRule', 'tiffinBillPolicyDate'],
    'Allowance Policy': ['allowancePolicyRule', 'allowancePolicyDate'],
    'Early Out Deduction Policy': ['earlyOutDeductionPolicyRule', 'earlyOutDeductionPolicyDate'],
    'Service Benefit Policy': ['serviceBenefitPolicyRule', 'serviceBenefitPolicyDate'],
    'HD Deduct Rule': ['hdDeductRuleRule', 'hdDeductRuleDate'],
  };

  const policies: PolicyFormData['policies'] = {};
  availablePolicies.forEach(policy => {
    const policyName = policy.policy_name;
    const [ruleKey, dateKey] = policyMapping[policyName] || ['', ''];
    policies[policyName] = {
      ruleName: data[ruleKey] || '',
      effectiveDate: data[dateKey] ? new Date(data[dateKey]).toISOString().split('T')[0] : '',
    };
  });

  return {
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
    policies,
  };
}

export default function EditPolicyTaggingPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PolicyFormData>({
    mode: 'onChange',
    defaultValues: {
      policies: {},
    },
  });

  // Fetch policies from Library first
  useEffect(() => {
    async function loadPolicies() {
      try {
        const data = await libraryService.getActivePoliciesWithRules();
        setPolicies(data);
        // Initialize form with policy keys
        const defaultPolicies = data.reduce((acc: PolicyFormData['policies'], policy: Policy) => {
          acc[policy.policy_name] = { ruleName: '', effectiveDate: '' };
          return acc;
        }, {} as PolicyFormData['policies']);
        reset({ policies: defaultPolicies });
      } catch (err) {
        console.error('Failed to load policies from Library:', err);
      } finally {
        setLoadingPolicies(false);
      }
    }
    loadPolicies();
  }, [reset]);

  useEffect(() => {
    if (!loadingPolicies && policies.length > 0) {
      loadRecord();
    }
  }, [id, loadingPolicies, policies]);

  async function loadRecord() {
    if (!id || isNaN(id)) {
      setError('Invalid record ID');
      setLoading(false);
      return;
    }

    try {
      const data = await employeePolicyTaggingService.getById(id);
      const formData = transformFromBackend(data, policies);
      reset(formData);
    } catch (err: any) {
      setError('Failed to load record: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: PolicyFormData) => {
    setError(null);
    setDuplicateError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await employeePolicyTaggingService.update(id, data);
      setSuccess('Policy tagging updated successfully!');
      setTimeout(() => {
        router.push('/employee-policy-tagging');
      }, 1500);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message;
      if (msg.includes('already has policy tagging')) {
        setDuplicateError(msg);
      } else {
        setError('Failed to update: ' + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingPolicies) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">{loadingPolicies ? 'Loading policies from Library...' : 'Loading record...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Edit Policy Tagging</h4>
          <p className="text-muted mb-0 small">
            <Link href="/employee-policy-tagging" className="text-decoration-none">
              <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
            </Link>
          </p>
        </div>
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

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Section 1: Employee Identification */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3 text-primary">Employee Identification</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Emp Code *</label>
                  <div className="input-group">
                    <input {...register('empCode', { required: true })} className={`form-control ${errors.empCode || duplicateError ? 'is-invalid' : ''}`} placeholder="Browse or Write" onChange={(e) => { register('empCode').onChange(e); setDuplicateError(null); }} />
                    <button type="button" className="btn btn-outline-secondary" title="Browse">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  {errors.empCode && <div className="invalid-feedback">Emp Code is required</div>}
                  {duplicateError && <div className="invalid-feedback d-block">{duplicateError}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Emp ID *</label>
                  <div className="input-group">
                    <input {...register('empId', { required: true })} className={`form-control ${errors.empId ? 'is-invalid' : ''}`} placeholder="Browse or Write" />
                    <button type="button" className="btn btn-outline-secondary" title="Browse">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  {errors.empId && <div className="invalid-feedback">Emp ID is required</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Emp Name</label>
                  <input {...register('empName')} className="form-control" />
                </div>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-md-3">
                  <label className="form-label">Category</label>
                  <select {...register('category')} className="form-select">
                    <option value="">Select</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Company</label>
                  <select {...register('company')} className="form-select">
                    <option value="">Select</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Location</label>
                  <select {...register('location')} className="form-select">
                    <option value="">Select</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Division</label>
                  <select {...register('division')} className="form-select">
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-md-3">
                  <label className="form-label">Department</label>
                  <select {...register('department')} className="form-select">
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Section</label>
                  <select {...register('section')} className="form-select">
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Subsection</label>
                  <select {...register('subsection')} className="form-select">
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Designation</label>
                  <select {...register('designation')} className="form-select">
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Policy Mapping Table */}
            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3 text-primary">Policy Mapping Table</h5>
              {policies.length === 0 ? (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  No active policies found in Library. Please create policies in the <Link href="/library/policies">Library</Link> first.
                </div>
              ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40%' }}>Policy Name</th>
                      <th style={{ width: '35%' }}>Rule Name</th>
                      <th style={{ width: '25%' }}>Effective Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy.id}>
                        <td className="align-middle">
                          <span className="fw-medium">{policy.policy_name}</span>
                          <div className="small text-muted">{policy.policy_code}</div>
                        </td>
                        <td>
                          <select {...register(`policies.${policy.policy_name}.ruleName`)} className="form-select form-select-sm">
                            <option value="">Select Rule</option>
                            {policy.rules?.map((rule: any) => (
                              <option key={rule.id} value={rule.rule_name}>{rule.rule_name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input type="date" {...register(`policies.${policy.policy_name}.effectiveDate`)} className="form-control form-control-sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Policy Tagging'}
              </button>
              <Link href="/employee-policy-tagging" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
