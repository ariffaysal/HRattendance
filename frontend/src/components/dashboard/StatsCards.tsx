'use client';

import { AttendanceStats } from '@/types/attendance';

interface StatsCardsProps {
  stats: AttendanceStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const dateRange = stats.fromDate && stats.toDate
    ? `${new Date(stats.fromDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${new Date(stats.toDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
    : new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

  return (
    <div className="stats-grid no-print">
      <div className="stat-card">
        <div className="stat-icon success">
          <i className="fas fa-user-check"></i>
        </div>
        <div className="stat-content">
          <h3>{stats.present}</h3>
          <p>Present</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon danger">
          <i className="fas fa-user-times"></i>
        </div>
        <div className="stat-content">
          <h3>{stats.absent}</h3>
          <p>Absent</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon primary">
          <i className="fas fa-clipboard-list"></i>
        </div>
        <div className="stat-content">
          <h3>{stats.total}</h3>
          <p>Total Records</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon warning">
          <i className="fas fa-calendar-alt"></i>
        </div>
        <div className="stat-content">
          <h5 className="stat-value">{dateRange}</h5>
          <p>Date Range</p>
        </div>
      </div>
    </div>
  );
}
