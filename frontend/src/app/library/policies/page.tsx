'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { libraryService, Policy } from '@/services/library.service';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies() {
    setLoading(true);
    try {
      const data = await libraryService.getAllPolicies();
      setPolicies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this policy? All associated rules will also be deleted.')) return;

    try {
      await libraryService.deletePolicy(id);
      await loadPolicies();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  }

  const filteredPolicies = policies.filter(p => 
    p.policy_name.toLowerCase().includes(search.toLowerCase()) ||
    p.policy_code.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">
            <Link href="/library" className="text-decoration-none text-dark">
              <i className="fas fa-arrow-left me-2"></i>
            </Link>
            Library Policies
          </h4>
          <p className="text-muted mb-0 small">Manage company policies and their rules</p>
        </div>
        <Link href="/library/policies/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> Add New Policy
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
              placeholder="Search by policy name, code, or category..."
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
                <th>Policy Code</th>
                <th>Policy Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Rules Count</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-book fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No policies found.</p>
                      <p className="small text-muted mt-2">Click "Add New Policy" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="fw-medium text-primary">{policy.policy_code}</td>
                    <td>
                      <div className="fw-medium">{policy.policy_name}</div>
                      {policy.description && (
                        <small className="text-muted">{policy.description.substring(0, 60)}...</small>
                      )}
                    </td>
                    <td>
                      {policy.category ? (
                        <span className="badge bg-info">{policy.category}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {policy.is_active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-primary">{policy.rule_count || 0} Rules</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link
                          href={`/library/policies/${policy.id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="Manage Rules"
                        >
                          <i className="fas fa-list-ol"></i> Rules
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(policy.id)}
                          title="Delete Policy"
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

      <div className="mt-3 text-muted small">
        <i className="fas fa-info-circle me-1"></i>
        Total: {filteredPolicies.length} policies
      </div>
    </div>
  );
}
