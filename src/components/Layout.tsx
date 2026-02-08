import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, ShoppingCart, Package, History, LogOut, Tag, Users, FileText, Activity, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    // Redirect handled by protected route in App.tsx
    return null;
  }

  const navItems = [
    { to: '/', icon: ShoppingCart, label: 'Kasir' },
    { to: '/products', icon: Package, label: 'Produk' },
    { to: '/history', icon: History, label: 'Riwayat' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">POS Gen Z</h1>
            <div className="mt-2">
              <p className="font-bold text-gray-800">{user.name}</p>
              <span className={clsx(
                "text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              )}>
                {user.role === 'admin' ? 'Administrator' : 'Kasir'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                  )
                }
              >
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
              <NavLink
                to="/promos"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                  )
                }
              >
                <Tag size={20} />
                Promo
              </NavLink>
              <NavLink
                to="/users"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                  )
                }
              >
                <Users size={20} />
                Pengguna
              </NavLink>
              <NavLink
                to="/reports"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                  )
                }
              >
                <FileText size={20} />
                Laporan
              </NavLink>
              <NavLink
                to="/activity-log"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                  )
                }
              >
                <Activity size={20} />
                Aktivitas
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium w-full"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-30">
          <h1 className="text-xl font-bold text-primary">POS Gen Z</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>

        <footer className="p-6 text-center text-gray-400 text-sm mt-auto">
          &copy; {new Date().getFullYear()} Legacy Software. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default Layout;
