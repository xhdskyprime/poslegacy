import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, ShoppingCart, Package, History, LogOut, Tag, Users, FileText, Activity, Menu, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAnalyticsMenuOpen, setIsAnalyticsMenuOpen] = useState(false);

  // Auto-open menus if on child routes
  useEffect(() => {
    if (location.pathname.startsWith('/users') || location.pathname.startsWith('/activity-log')) {
      setIsUserMenuOpen(true);
    }
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/reports')) {
      setIsAnalyticsMenuOpen(true);
    }
  }, [location.pathname]);

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
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={clsx("p-6 border-b border-gray-100 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <div>
              <h1 className="text-2xl font-bold text-primary truncate">POS Gen Z</h1>
              <div className="mt-2">
                <p className="font-bold text-gray-800 truncate">{user.name}</p>
                <span className={clsx(
                  "text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                  user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                )}>
                  {user.role === 'admin' ? 'Admin' : 'Kasir'}
                </span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xl">
              P
            </div>
          )}
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-all text-gray-500 hover:text-primary z-50"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary',
                  isCollapsed && 'justify-center px-2'
                )
              }
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              {!isCollapsed ? (
                // Expanded View: Analytics Group
                <div className="space-y-1">
                  <button
                    onClick={() => setIsAnalyticsMenuOpen(!isAnalyticsMenuOpen)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap',
                      (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/reports'))
                        ? 'text-primary bg-indigo-50'
                        : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard size={20} className="shrink-0" />
                      <span>Analisis Bisnis</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={clsx("transition-transform duration-200", isAnalyticsMenuOpen ? "rotate-180" : "")}
                    />
                  </button>

                  <div className={clsx("overflow-hidden transition-all duration-300 space-y-1", isAnalyticsMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ml-4 text-sm',
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                        )
                      }
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/reports"
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ml-4 text-sm',
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                        )
                      }
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span>Laporan Penjualan</span>
                    </NavLink>
                  </div>
                </div>
              ) : (
                // Collapsed View: Separate Icons
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsSidebarOpen(false)}
                    title="Dashboard"
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap justify-center px-2',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                      )
                    }
                  >
                    <LayoutDashboard size={20} className="shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/reports"
                    onClick={() => setIsSidebarOpen(false)}
                    title="Laporan"
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap justify-center px-2',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                      )
                    }
                  >
                    <FileText size={20} className="shrink-0" />
                  </NavLink>
                </>
              )}

              <NavLink
                to="/promos"
                onClick={() => setIsSidebarOpen(false)}
                title={isCollapsed ? "Promo" : undefined}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-500 hover:bg-indigo-50 hover:text-primary',
                    isCollapsed && 'justify-center px-2'
                  )
                }
              >
                <Tag size={20} className="shrink-0" />
                {!isCollapsed && <span>Promo</span>}
              </NavLink>
              {!isCollapsed ? (
                // Expanded View: Sub-menu Group
                <div className="space-y-1">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap',
                      (location.pathname.startsWith('/users') || location.pathname.startsWith('/activity-log'))
                        ? 'text-primary bg-indigo-50'
                        : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={20} className="shrink-0" />
                      <span>Manajemen User</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={clsx("transition-transform duration-200", isUserMenuOpen ? "rotate-180" : "")}
                    />
                  </button>

                  <div className={clsx("overflow-hidden transition-all duration-300 space-y-1", isUserMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                    <NavLink
                      to="/users"
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ml-4 text-sm',
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                        )
                      }
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span>Daftar Pengguna</span>
                    </NavLink>
                    <NavLink
                      to="/activity-log"
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ml-4 text-sm',
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                        )
                      }
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span>Log Aktivitas</span>
                    </NavLink>
                  </div>
                </div>
              ) : (
                // Collapsed View: Separate Icons
                <>
                  <NavLink
                    to="/users"
                    onClick={() => setIsSidebarOpen(false)}
                    title="Pengguna"
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap justify-center px-2',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                      )
                    }
                  >
                    <Users size={20} className="shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/activity-log"
                    onClick={() => setIsSidebarOpen(false)}
                    title="Aktivitas"
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap justify-center px-2',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-gray-500 hover:bg-indigo-50 hover:text-primary'
                      )
                    }
                  >
                    <Activity size={20} className="shrink-0" />
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar" : undefined}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium w-full whitespace-nowrap",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
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
