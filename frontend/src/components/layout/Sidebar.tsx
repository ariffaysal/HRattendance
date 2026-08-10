'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { attendanceService } from '@/services/attendance.service';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  href?: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Attendance',
    icon: 'fa-fingerprint',
    children: [
      { href: '/', label: 'Dashboard', icon: 'fa-chart-line' },
      { href: '/job-cards', label: 'Job Cards', icon: 'fa-id-card' },
      { href: '/monthly', label: 'Reports', icon: 'fa-calendar-alt' },
    ],
  },
  {
    label: 'Employees',
    icon: 'fa-users',
    children: [
      { href: '/employees', label: 'Employees', icon: 'fa-user' },
      { href: '/employee-address', label: 'Employee Address', icon: 'fa-map-marker-alt' },
      { href: '/employee-education', label: 'Employee Education Information', icon: 'fa-graduation-cap' },
      { href: '/employee-policy-tagging', label: 'Employee Policy Tagging Information', icon: 'fa-tags' },
      { href: '/employee-salary-information', label: 'Employee Salary Information', icon: 'fa-money-bill-wave' },
    ],
  },
  {
    label: 'Library',
    icon: 'fa-book',
    children: [
      { href: '/library', label: 'Library Dashboard', icon: 'fa-book-open' },
      { href: '/library/policies', label: 'Manage Policies', icon: 'fa-list-check' },
      { href: '/employee-policy-tagging', label: 'Assign to Employees', icon: 'fa-user-tag' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const toggleMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isChildActive = (children?: NavItem[]) => children?.some(child => child.href && isActive(child.href));

  const handleReset = async () => {
    if (confirm('This will wipe all attendance data. Continue?')) {
      try {
        await attendanceService.clearData();
        window.location.href = '/';
      } catch (error) {
        console.error('Failed to reset data:', error);
        alert('Failed to reset data. Please try again.');
      }
    }
  };

  return (
    <div className="sidebar no-print">
      <div className="sidebar-brand">
        <Link href="/skyview" className="text-decoration-none">
          <h4 className="text-white">
            <i className="fas fa-fingerprint"></i>
            <span>SkyView Attendance</span>
          </h4>
        </Link>
      </div>
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`nav-link nav-link-parent ${isChildActive(item.children) ? 'active' : ''}`}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.label}</span>
                  <i className={`fas fa-chevron-down submenu-arrow ${expandedMenu === item.label ? 'expanded' : ''}`}></i>
                </button>
                <div className={`submenu ${expandedMenu === item.label ? 'expanded' : ''}`}>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href || '#'}
                      className={`nav-link nav-link-child ${pathname === child.href ? 'active' : ''}`}
                    >
                      <i className={`fas ${child.icon}`}></i>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={item.href || '#'}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <i className={`fas ${item.icon}`}></i>
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        {user && (
          <div className="px-3 pb-3">
            <div className="text-white text-sm mb-1">
              <i className="fas fa-user me-2"></i>
              <span className="fw-semibold">{user.employeeId}</span>
            </div>
            <div className="text-slate-400 text-xs mb-3">
              {user.email}
            </div>
          </div>
        )}
        <button
          className="btn btn-outline-light btn-sm w-100 mb-2"
          onClick={logout}
        >
          <i className="fas fa-sign-out-alt me-2"></i> Logout
        </button>
        <button
          className="btn btn-outline-danger btn-sm w-100"
          onClick={handleReset}
        >
          <i className="fas fa-trash-alt me-2"></i> Reset Data
        </button>
      </div>
    </div>
  );
}
