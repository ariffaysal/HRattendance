'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

// Routes that should not show the sidebar
const noSidebarRoutes = ['/skyview', '/login', '/register'];

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !noSidebarRoutes.some(route => pathname === route || pathname?.startsWith(route));

  return (
    <div className={showSidebar ? 'd-flex' : ''}>
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'main-content flex-grow-1' : ''}>
        {children}
      </main>
    </div>
  );
}
