import { Bell, Check, Package, Truck, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import PageHeader from '../components/PageHeader';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIconInfo = (type) => {
    switch (type) {
      case 'delivery': return { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'request': return { icon: Package, color: 'text-primary-500', bg: 'bg-primary-100' };
      case 'alert': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-100' };
      default: return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Notifications" subtitle="Stay updated on your requests and deliveries">
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 transition-colors hover:bg-slate-50 hover:text-primary-600"
          >
            <Check className="h-4 w-4" /> Mark all read
          </button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 px-8">
            <div className="mb-5 rounded-full bg-slate-50 p-6">
              <Bell className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">You're all caught up!</h3>
            <p className="mt-2 text-sm text-slate-500">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const { icon: Icon, color, bg } = getIconInfo(n.type);
            return (
              <div
                key={n._id}
                onClick={() => !n.readStatus && markAsRead(n._id)}
                className={`group animate-slide-in-right relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:shadow-md ${
                  n.readStatus
                    ? 'border-slate-200 bg-white'
                    : 'border-primary-200 bg-gradient-to-r from-primary-50/50 to-teal-50/50'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {!n.readStatus && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-teal-500" />
                )}
                <div className="flex items-start gap-4 ml-2">
                  <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`font-bold ${n.readStatus ? 'text-slate-700' : 'text-slate-900'}`}>
                        {n.title}
                      </p>
                      <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${n.readStatus ? 'text-slate-500' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
