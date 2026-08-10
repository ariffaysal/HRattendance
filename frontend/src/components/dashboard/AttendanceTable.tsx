'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface AttendanceTableProps {
  records: string[][];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
  loading: boolean;
}

export function AttendanceTable({ records, pagination, loading }: AttendanceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', page.toString());
    router.push(`?${newParams.toString()}`);
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="card table-container border-0 shadow-sm">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          <i className="fas fa-list me-2 text-primary"></i>Attendance Logs
        </h5>
        <span className="badge bg-light text-dark">
          {records.length} of {pagination.total} records
        </span>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Emp No.</th>
              <th>Name</th>
              <th>Date</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Work Time</th>
              <th>Late</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={idx}>
                <td>
                  <span className={`badge rounded-pill px-3 ${r[0] === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                    {r[0]}
                  </span>
                </td>
                <td className="fw-medium">#{r[1]}</td>
                <td className="fw-semibold text-dark">{r[4]}</td>
                <td>{r[6]}</td>
                <td className="text-success fw-medium">{r[10] || '--:--'}</td>
                <td className="text-danger fw-medium">{r[11] || '--:--'}</td>
                <td>{r[18] || '0:00'}</td>
                <td>
                  {r[14] && r[14] !== '00:00' ? (
                    <span className="text-warning fw-bold small">{r[14]}</span>
                  ) : (
                    <span className="text-muted small">-</span>
                  )}
                </td>
                <td className="text-muted small">{r[22] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="card-footer bg-white d-flex justify-content-center">
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(pagination.currentPage - 1)}>Previous</button>
              </li>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => goToPage(page)}>{page}</button>
                </li>
              ))}
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(pagination.currentPage + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
