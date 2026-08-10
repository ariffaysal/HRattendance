'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { attendanceService, SearchParams } from '@/services/attendance.service';
import { JobCardEmployee } from '@/types/attendance';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FileUpload } from '@/components/dashboard/FileUpload';

export default function JobCardsPage() {
  const searchParams = useSearchParams();
  const [jobCards, setJobCards] = useState<JobCardEmployee[]>([]);
  const [hasCache, setHasCache] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentParams: SearchParams = {
    search: searchParams.get('search') || '',
    searchType: (searchParams.get('searchType') as any) || 'general',
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  async function loadData() {
    setLoading(true);
    try {
      const cacheExists = await attendanceService.checkCache();
      setHasCache(cacheExists);

      if (cacheExists) {
        const data = await attendanceService.getJobCards(currentParams);
        setJobCards(data);
      }
    } catch (error) {
      console.error('Failed to load job cards:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (file: File) => {
    const result = await attendanceService.uploadFile(file);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  if (!hasCache) {
    return (
      <div>
        <h4 className="mb-4 fw-bold">Job Cards</h4>
        <div className="alert alert-info">
          <h5><i className="fas fa-info-circle me-2"></i>No Data Available</h5>
          <p>Please upload an attendance CSV file first to view job cards.</p>
          <FileUpload onUpload={handleUpload} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <h4 className="mb-0 fw-bold">Job Cards</h4>
        <div className="d-flex gap-2">
          <SearchBar params={currentParams} />
          <button onClick={() => window.print()} className="btn btn-outline-dark">
            <i className="fas fa-print me-2"></i> Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : (
        jobCards.map(employee => (
          <JobCard key={employee.empId} employee={employee} />
        ))
      )}
    </div>
  );
}

function JobCard({ employee }: { employee: JobCardEmployee }) {
  const { summary, records } = employee;

  return (
    <div className="report-paper shadow-lg mb-5" style={{ pageBreakAfter: 'always' }}>
      <div className="report-header">
        <h2 className="fw-bold mb-0">Skyview Online LTD</h2>
        <h4 className="mt-4 fw-bold">INDIVIDUAL ATTENDANCE JOB CARD</h4>
      </div>
      
      <div className="row mb-4 px-3">
        <div className="col-3">
          <strong className="text-muted">NAME:</strong><br />{employee.name}
        </div>
        <div className="col-3">
          <strong className="text-muted">EMP CODE:</strong><br />{employee.idCard}
        </div>
        <div className="col-3">
          <strong className="text-muted">ID:</strong><br />{employee.empCode}
        </div>
        <div className="col-3">
          <strong className="text-muted">DEPARTMENT:</strong><br />{employee.dept}
        </div>
      </div>

      <div className="stats-box mb-4">
        <h6 className="fw-bold border-bottom pb-2 mb-3 text-uppercase small">Attendance Summary</h6>
        <div className="table-responsive">
          <table className="table table-sm table-bordered mb-0">
            <thead className="table-light">
              <tr className="text-center">
                <th style={{ minWidth: '80px' }}>Total Days</th>
                <th style={{ minWidth: '80px' }}>Weekend</th>
                <th style={{ minWidth: '100px' }}>Working Days</th>
                <th style={{ minWidth: '70px' }}>Absent</th>
                <th style={{ minWidth: '70px' }}>Present</th>
                <th style={{ minWidth: '70px' }}>Late</th>
                <th style={{ minWidth: '90px' }}>Early Out</th>
                <th style={{ minWidth: '100px' }}>Payable Days</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center fw-bold">
                <td>{summary.totalDays}</td>
                <td>{summary.weekend}</td>
                <td>{summary.workingDays}</td>
                <td className="text-danger">{summary.absent}</td>
                <td className="text-success">{summary.present}</td>
                <td className="text-warning">{summary.late}</td>
                <td className="text-danger">{summary.earlyOut}</td>
                <td className="table-warning">{summary.payableDays}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table className="table table-bordered table-sm text-center">
        <thead className="table-dark">
          <tr>
            <th style={{ width: '100px' }}>Date</th>
            <th style={{ width: '60px' }}>Day</th>
            <th style={{ width: '80px' }}>In Time</th>
            <th style={{ width: '80px' }}>Out Time</th>
            <th style={{ width: '70px' }}>Late</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => (
            <tr key={idx} className={r.isFriday ? 'table-light' : ''}>
              <td>{r.date}</td>
              <td>
                {r.isFriday && !r.isPresent ? (
                  <span className="text-muted">{r.day}</span>
                ) : (
                  r.day
                )}
              </td>
              <td>{r.inTime}</td>
              <td>{r.outTime}</td>
              <td>{r.late}</td>
              <td>
                <span className={`badge ${r.status === 'Present' ? 'bg-success' : r.status === 'OFF' ? 'bg-secondary' : 'bg-danger'}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
