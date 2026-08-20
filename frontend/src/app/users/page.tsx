'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersService, AuthUser, CreateUserData } from '@/services/users.service';
import type { UserRole } from '@/services/auth.service';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  hr: 'HR',
  employee: 'Employee',
};

const ROLE_BADGES: Record<UserRole, string> = {
  admin: 'bg-danger',
  hr: 'bg-info',
  employee: 'bg-secondary',
};

// Mirrors the backend's strong-password rule (min 8 chars, upper+lower+digit+symbol)
function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

const EMPTY_FORM: CreateUserData = {
  employeeId: '',
  email: '',
  mobileNumber: '',
  password: '',
  role: 'employee',
};

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateUserData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [pageError, setPageError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err: any) {
      setPageError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  if (!isAdmin) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <i className="fas fa-shield-alt fa-3x text-danger mb-3"></i>
          <h4 className="fw-bold">Access Denied</h4>
          <p className="text-muted">Only administrators can manage user accounts.</p>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isStrongPassword(form.password)) {
      setFormError(
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      );
      return;
    }

    try {
      const result = await usersService.create(form);
      setFormSuccess(result.message);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const handleRoleChange = async (user: AuthUser, role: UserRole) => {
    if (!confirm(`Change role of ${user.employeeId} to ${ROLE_LABELS[role]}?`)) return;
    try {
      await usersService.update(user.id, { role });
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleActive = async (user: AuthUser) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.employeeId}?`)) return;
    try {
      await usersService.update(user.id, { isActive: !user.isActive });
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update account');
    }
  };

  const handleResetPassword = async (user: AuthUser) => {
    const newPassword = prompt(
      `Enter a new password for ${user.employeeId} (min 8 chars, upper+lower+number+symbol):`,
    );
    if (!newPassword) return;
    if (!isStrongPassword(newPassword)) {
      alert('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
      return;
    }
    try {
      const result = await usersService.resetPassword(user.id, newPassword);
      alert(result.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">User Management</h4>
          <p className="text-muted mb-0 small">
            Create and manage login accounts (admin, HR, employee) - registration is disabled.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'} me-2`}></i>
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {pageError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {pageError}
          <button type="button" className="btn-close" onClick={() => setPageError('')} aria-label="Close"></button>
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-white">
            <h6 className="mb-0 fw-bold">
              <i className="fas fa-user-plus me-2 text-primary"></i> New Account
            </h6>
          </div>
          <div className="card-body">
            {formError && <div className="alert alert-danger py-2">{formError}</div>}
            {formSuccess && <div className="alert alert-success py-2">{formSuccess}</div>}
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Employee ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. EMP-001 or admin"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 01712345678"
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min 8 chars: upper + lower + number + symbol"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-3">
                <i className="fas fa-check me-2"></i> Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee ID</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fas fa-users fa-2x mb-3 opacity-50"></i>
                      <p className="mb-0">No accounts found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-medium text-primary">{user.employeeId}</td>
                    <td>{user.email}</td>
                    <td>{user.mobileNumber}</td>
                    <td>
                      <select
                        className="form-select form-select-sm d-inline-block w-auto"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                      >
                        <option value="employee">Employee</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas ${user.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleResetPassword(user)}
                          title="Reset Password"
                        >
                          <i className="fas fa-key"></i>
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
    </div>
  );
}
