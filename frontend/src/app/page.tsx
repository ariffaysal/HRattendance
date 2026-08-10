'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { attendanceService, SearchParams } from '@/services/attendance.service';
import { AttendanceStats } from '@/types/attendance';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AttendanceTable } from '@/components/dashboard/AttendanceTable';
import { FileUpload } from '@/components/dashboard/FileUpload';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [hasCache, setHasCache] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, total: 0 });
  const [records, setRecords] = useState<string[][]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
    perPage: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const currentParams: SearchParams = {
    search: searchParams.get('search') || '',
    searchType: (searchParams.get('searchType') as any) || 'general',
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
    page: parseInt(searchParams.get('page') || '1'),
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const cacheExists = await attendanceService.checkCache();
      setHasCache(cacheExists);

      if (cacheExists) {
        const [statsData, recordsData] = await Promise.all([
          attendanceService.getStats(currentParams),
          attendanceService.getRecords(currentParams),
        ]);
        setStats(statsData);
        setRecords(recordsData.records);
        setPagination({
          total: recordsData.total,
          currentPage: recordsData.currentPage,
          totalPages: recordsData.totalPages,
          perPage: recordsData.perPage,
        });
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await attendanceService.uploadFile(file);
      if (result.success) {
        await loadData();
      } else {
        setError(result.message || 'Upload failed');
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      return { success: false, message: err.message };
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4">
        <div>
          <h4 className="mb-1 fw-bold">Dashboard</h4>
          <p className="text-muted mb-0 small">Overview of attendance data</p>
        </div>
        <FileUpload onUpload={handleUpload} uploading={uploading} />
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {!hasCache ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="fas fa-cloud-upload-alt fa-4x text-primary opacity-50"></i>
            </div>
            <h5 className="text-muted mb-3">No Data Available</h5>
            <p className="text-muted mb-4">Upload an attendance CSV file to get started with the system.</p>
            <FileUpload onUpload={handleUpload} uploading={uploading} />
          </div>
        </div>
      ) : (
        <>
          <SearchBar params={currentParams} />
          <StatsCards stats={stats} />
          <AttendanceTable
            records={records}
            pagination={pagination}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
