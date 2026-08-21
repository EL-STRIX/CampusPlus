import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/reports/') && path !== '/reports/needs-review') return 'Report Details';
    if (path.startsWith('/reports')) return 'All Reports';
    if (path.startsWith('/needs-review')) return 'Needs Review Queue';
    if (path.startsWith('/profile')) return 'Admin Profile';
    return 'CampusPlus Admin';
  };

  return (
    <div className="min-h-screen flex bg-background text-on-background antialiased">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          title={getPageTitle(location.pathname)}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-container-max w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
