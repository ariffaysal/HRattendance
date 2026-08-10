'use client';

import Link from 'next/link';

export default function LibraryDashboard() {
  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Library</h4>
          <p className="text-muted mb-0 small">Manage policies and rules configuration</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Policies Card */}
        <div className="col-md-6 col-lg-4">
          <Link href="/library/policies" className="text-decoration-none">
            <div className="card h-100 hover-lift">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="stat-icon primary">
                    <i className="fas fa-book"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="card-title mb-1 text-dark">Policies</h5>
                    <p className="text-muted mb-0 small">Manage policy definitions</p>
                  </div>
                </div>
                <p className="card-text text-muted">
                  Create and manage company policies. Each policy can have multiple rules assigned.
                </p>
                <div className="mt-3">
                  <span className="badge bg-primary">View Policies</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Rules Card */}
        <div className="col-md-6 col-lg-4">
          <Link href="/library/policies" className="text-decoration-none">
            <div className="card h-100 hover-lift">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="stat-icon success">
                    <i className="fas fa-list-ol"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="card-title mb-1 text-dark">Policy Rules</h5>
                    <p className="text-muted mb-0 small">Configure rules for each policy</p>
                  </div>
                </div>
                <p className="card-text text-muted">
                  Define rules for policies like Rule 1, Rule 2, etc. Set conditions and calculations.
                </p>
                <div className="mt-3">
                  <span className="badge bg-success">Manage Rules</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Policy Assignment Card */}
        <div className="col-md-6 col-lg-4">
          <Link href="/employee-policy-tagging" className="text-decoration-none">
            <div className="card h-100 hover-lift">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="stat-icon warning">
                    <i className="fas fa-user-tag"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="card-title mb-1 text-dark">Assign to Employees</h5>
                    <p className="text-muted mb-0 small">Policy tagging for employees</p>
                  </div>
                </div>
                <p className="card-text text-muted">
                  Assign library policies and rules to individual employees based on their profile.
                </p>
                <div className="mt-3">
                  <span className="badge bg-warning text-dark">Go to Tagging</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5 className="mb-0"><i className="fas fa-info-circle me-2 text-primary"></i>How to Use Library</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <span className="badge bg-primary rounded-circle p-2">1</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6>Create Policies</h6>
                  <p className="small text-muted mb-0">Add policies like Overtime, Leave, Bonus in the Policies section.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <span className="badge bg-success rounded-circle p-2">2</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6>Define Rules</h6>
                  <p className="small text-muted mb-0">For each policy, create rules (Rule 1, Rule 2, etc.) with conditions.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <span className="badge bg-warning rounded-circle p-2">3</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6>Assign to Employees</h6>
                  <p className="small text-muted mb-0">Use Employee Policy Tagging to assign policies and rules to staff.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
