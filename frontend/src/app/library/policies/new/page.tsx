'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { libraryService } from '@/services/library.service';

const CATEGORIES = [
  'Compensation',
  'Deductions', 
  'Leave Management',
  'Scheduling',
  'Taxation',
  'Allowances',
  'Benefits',
  'Other'
];

export default function NewPolicyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    policy_code: '',
    policy_name: '',
    description: '',
    category: '',
    is_active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await libraryService.createPolicy(formData);
      setSuccess('Policy created successfully!');
      setTimeout(() => {
        router.push('/library/policies');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">
            <Link href="/library/policies" className="text-decoration-none text-dark">
              <i className="fas fa-arrow-left me-2"></i>
            </Link>
            Add New Policy
          </h4>
          <p className="text-muted mb-0 small">Create a new policy in the library</p>
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

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Policy Code *</label>
                <input
                  type="text"
                  name="policy_code"
                  className="form-control"
                  placeholder="e.g., OVERTIME, LEAVE, BONUS"
                  value={formData.policy_code}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">Unique code for the policy (uppercase recommended)</small>
              </div>

              <div className="col-md-6">
                <label className="form-label">Policy Name *</label>
                <input
                  type="text"
                  name="policy_name"
                  className="form-control"
                  placeholder="e.g., Overtime Policy"
                  value={formData.policy_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Status</label>
                <div className="form-check form-switch mt-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="form-check-input"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  placeholder="Enter policy description..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <><i className="fas fa-save me-2"></i>Save Policy</>
                )}
              </button>
              <Link href="/library/policies" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
