import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/cargo', icon: 'table_rows', label: 'Cargo Booking' },
  { to: '/cargo/new', icon: 'add_circle', label: 'Create Booking' },
  { to: '/scheduling', icon: 'calendar_month', label: 'Shipment Scheduling' },
  { to: '/track', icon: 'my_location', label: 'Cargo Tracking' },
  { to: '/routes', icon: 'route', label: 'Route Management' },
  { to: '/reports', icon: 'pie_chart', label: 'Operations Reports' },
  { to: '/history', icon: 'history', label: 'Shipment History' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!notifOpen) return;

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifOpen]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-primary/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col bg-surface-container-low
        border-r border-outline-variant transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-outline-variant">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <svg fill="none" viewBox="0 0 48 48" className="w-5 h-5 text-on-primary" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="text-primary text-base font-bold leading-none">LogiFlow</h1>
            <p className="text-on-surface-variant text-xs mt-0.5">Logistics Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to ||
              (item.to === '/cargo' && location.pathname === '/cargo') ||
              (item.to !== '/dashboard' && item.to !== '/cargo' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${active ? 'nav-item-active' : ''}`}
              >
                <span className={`material-symbols-outlined text-xl ${active ? 'material-symbols-filled' : ''}`}>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-outline-variant space-y-0.5">
          <Link to="/profile" onClick={() => setSidebarOpen(false)} className={`nav-item ${location.pathname === '/profile' ? 'nav-item-active' : ''}`}>
            <span className="material-symbols-outlined text-xl">person</span>
            <span className="text-sm font-medium">Profile</span>
          </Link>
          <button onClick={handleLogout} className="nav-item w-full hover:bg-error-container hover:text-on-error-container text-left">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
          <p className="text-[10px] text-on-surface-variant px-3 pt-2">© 2024 LogiFlow Systems Inc.</p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Header ── */}
        <header className="flex items-center gap-4 px-6 py-3 bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-30 flex-shrink-0">
          {/* Mobile menu btn */}
          <button className="lg:hidden btn-ghost p-2" onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
              <input
                type="text"
                className="input-with-icon h-10 text-sm"
                placeholder="Search shipments, customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="btn-ghost p-2.5 relative"
                onClick={() => setNotifOpen(p => !p)}
                aria-label="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="true"
              >
                <span className="material-symbols-outlined text-2xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card-hover z-[100] animate-slide-up"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                    <h3 className="font-semibold text-on-surface text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="text-xs text-accent font-medium hover:underline"
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-on-surface-variant text-center">No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleNotificationClick(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors ${!n.isRead ? 'bg-secondary-container/20' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-accent' : 'bg-transparent'}`} />
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{n.title}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{n.message}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="btn-ghost p-2">
              <span className="material-symbols-outlined">settings</span>
            </button>

            {/* User avatar */}
            <Link to="/profile" className="flex items-center gap-2.5 pl-2 border-l border-outline-variant ml-1">
              <div className="w-9 h-9 rounded-full bg-primary-container ring-2 ring-primary-fixed flex items-center justify-center text-sm font-bold text-on-primary-container cursor-pointer hover:ring-accent transition-all">
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-on-surface leading-none">{user?.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{user?.role?.replace('_', ' ')}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 animate-fade-in">
          <div className="p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
