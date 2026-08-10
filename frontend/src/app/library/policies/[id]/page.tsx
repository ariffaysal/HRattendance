'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { libraryService, Policy, PolicyRule } from '@/services/library.service';

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = parseInt(params.id as string);

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);

  // New rule form state
  const [newRule, setNewRule] = useState({
    rule_code: '',
    rule_name: '',
    description: '',
    is_active: true,
  });

  // Edit rule form state
  const [editingRule, setEditingRule] = useState<PolicyRule | null>(null);
  const [editForm, setEditForm] = useState({
    rule_code: '',
    rule_name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadPolicyAndRules();
  }, [policyId]);

  async function loadPolicyAndRules() {
    setLoading(true);
    try {
      const [policyData, rulesData] = await Promise.all([
        libraryService.getPolicyById(policyId),
        libraryService.getRulesByPolicy(policyId),
      ]);
      setPolicy(policyData);
      setRules(rulesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load policy details');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    try {
      await libraryService.createRule(policyId, newRule);
      setNewRule({ rule_code: '', rule_name: '', description: '', is_active: true });
      setShowAddRule(false);
      await loadPolicyAndRules();
    } catch (err: any) {
      alert('Failed to add rule: ' + err.message);
    }
  }

  async function handleDeleteRule(ruleId: number) {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await libraryService.deleteRule(ruleId);
      await loadPolicyAndRules();
    } catch (err: any) {
      alert('Failed to delete rule: ' + err.message);
    }
  }

  async function handleToggleRuleStatus(rule: PolicyRule) {
    try {
      await libraryService.updateRule(rule.id, { is_active: !rule.is_active });
      await loadPolicyAndRules();
    } catch (err: any) {
      alert('Failed to update rule: ' + err.message);
    }
  }

  function startEditRule(rule: PolicyRule) {
    setEditingRule(rule);
    setEditForm({
      rule_code: rule.rule_code,
      rule_name: rule.rule_name,
      description: rule.description || '',
      is_active: rule.is_active,
    });
  }

  function cancelEditRule() {
    setEditingRule(null);
    setEditForm({
      rule_code: '',
      rule_name: '',
      description: '',
      is_active: true,
    });
  }

  async function handleUpdateRule(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRule) return;
    
    try {
      await libraryService.updateRule(editingRule.id, editForm);
      setEditingRule(null);
      await loadPolicyAndRules();
    } catch (err: any) {
      alert('Failed to update rule: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-circle me-2"></i>
        Policy not found
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Link href="/library/policies" className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-arrow-left"></i>
                </Link>
                <h4 className="mb-0 fw-bold">{policy.policy_name}</h4>
                <span className={`badge ${policy.is_active ? 'bg-success' : 'bg-secondary'}`}>
                  {policy.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-muted mb-0 small">
                <span className="fw-medium text-primary">{policy.policy_code}</span>
                {policy.category && (
                  <span className="ms-2 badge bg-info">{policy.category}</span>
                )}
              </p>
              {policy.description && (
                <p className="mt-2 text-muted mb-0">{policy.description}</p>
              )}
            </div>
            <button
              className={`btn ${showAddRule ? 'btn-outline-secondary' : 'btn-primary'} d-flex align-items-center gap-2`}
              onClick={() => setShowAddRule(!showAddRule)}
            >
              <i className={`fas ${showAddRule ? 'fa-times' : 'fa-plus'}`}></i>
              <span>{showAddRule ? 'Cancel' : 'Add New Rule'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Add Rule Form */}
      {showAddRule && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <i className="fas fa-plus-circle me-2"></i>Add New Rule
          </div>
          <div className="card-body">
            <form onSubmit={handleAddRule}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Rule Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., RULE_1, STANDARD"
                    value={newRule.rule_code}
                    onChange={(e) => setNewRule({ ...newRule, rule_code: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Rule Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Standard Rule, Exception Rule"
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <div className="form-check form-switch mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={newRule.is_active}
                      onChange={(e) => setNewRule({ ...newRule, is_active: e.target.checked })}
                    />
                    <label className="form-check-label">{newRule.is_active ? 'Active' : 'Inactive'}</label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Describe the rule conditions and calculations..."
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save me-2"></i>Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules Table */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0"><i className="fas fa-list-ol me-2"></i>Policy Rules</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Rule Code</th>
                <th>Rule Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="text-muted">
                      <i className="fas fa-list fa-2x mb-2 opacity-50"></i>
                      <p className="mb-0">No rules defined for this policy.</p>
                      <p className="small text-muted">Click "Add Rule" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    {editingRule?.id === rule.id ? (
                      // Edit mode
                      <>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editForm.rule_code}
                            onChange={(e) => setEditForm({ ...editForm, rule_code: e.target.value })}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editForm.rule_name}
                            onChange={(e) => setEditForm({ ...editForm, rule_name: e.target.value })}
                            required
                          />
                        </td>
                        <td>
                          <textarea
                            className="form-control form-control-sm"
                            rows={1}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="form-check form-switch mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={editForm.is_active}
                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                              />
                            </div>
                            {editForm.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </div>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={handleUpdateRule}
                            title="Save Changes"
                          >
                            <i className="fas fa-save"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={cancelEditRule}
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="fw-medium text-primary">{rule.rule_code}</td>
                        <td className="fw-medium">{rule.rule_name}</td>
                        <td>
                          {rule.description ? (
                            <small className="text-muted">{rule.description}</small>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="form-check form-switch mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={rule.is_active}
                                onChange={() => handleToggleRuleStatus(rule)}
                              />
                            </div>
                            {rule.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </div>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => startEditRule(rule)}
                            title="Edit Rule"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteRule(rule.id)}
                            title="Delete Rule"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-muted small">
        <i className="fas fa-info-circle me-1"></i>
        Total: {rules.length} rules for this policy
      </div>
    </div>
  );
}
