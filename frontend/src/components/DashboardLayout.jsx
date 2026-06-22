import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut, Pill, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export default function DashboardLayout({ children, navItems, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const filteredNav = searchQuery
    ? navItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : navItems;

  const notificationPath = navItems.find((n) => n.label.includes('Notification'))?.path || '#';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 shadow-2xl transition-transform duration-300 lg:relative lg:flex lg:translate-x-0 flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-teal-400 shadow-lg shadow-primary-500/20">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MedZu</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-1 text-slate-400 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-slate-300 placeholder-slate-500 outline-none transition-colors focus:border-primary-500/50 focus:bg-white/10"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {filteredNav.map((item, idx) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 shadow-sm shadow-primary-500/10 border-l-2 border-primary-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
                }`
              }
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <item.icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer - User info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-teal-400 text-xs font-bold text-white shadow-lg">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="truncate text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-rose-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={() => navigate(notificationPath)}
            >
              <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] font-bold text-white shadow-lg shadow-rose-200">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {/* User avatar */}
            <button 
              onClick={() => {
                const profilePath = navItems.find((n) => n.label.includes('Profile'))?.path || '/profile';
                navigate(profilePath);
              }}
              className="hidden items-center gap-3 sm:flex hover:bg-slate-100 rounded-xl p-2 transition-colors cursor-pointer"
              title="Go to Profile"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs capitalize text-slate-500">{user?.role}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-teal-400 text-xs font-bold text-white shadow-md">
                {initials}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
