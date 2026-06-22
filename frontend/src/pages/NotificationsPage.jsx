import {
  Bell, Check, Package, Truck, AlertCircle, Info, RefreshCw,
  CheckCheck, Zap, ArrowRight, Pill, Building2, User, Hash
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSocket } from '../contexts/SocketContext';

const TYPE_CONFIG = {
  request_received: { icon: Package, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]', label: 'Request Received' },
  request_accepted: { icon: Check, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]', label: 'Request Accepted' },
  request_rejected: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400', bar: 'bg-red-400', label: 'Request Rejected' },
  distributor_assigned: { icon: Truck, color: 'text-violet-500', bg: 'bg-violet-50', dot: 'bg-violet-400', bar: 'bg-violet-400', label: 'Distributor Assigned' },
  pickup_started: { icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-400', bar: 'bg-amber-400', label: 'Pickup Started' },
  medicine_picked: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400', bar: 'bg-blue-400', label: 'Medicine Picked' },
  delivery_started: { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400', bar: 'bg-blue-400', label: 'Delivery Started' },
  delivery_completed: { icon: Check, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]', label: 'Delivered' },
  inventory_updated: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-400', bar: 'bg-amber-400', label: 'Inventory Updated' },
  general: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-100', dot: 'bg-gray-400', bar: 'bg-gray-300', label: 'General' },
};

const getCfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' });
};

function RequestChip({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
      <Icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold leading-none mb-0.5">{label}</p>
        <p className="text-[10px] font-bold text-[#2a3441] truncate max-w-[100px]">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  const map = {
    pending: 'bg-amber-50 text-amber-600',
    accepted: 'bg-[#e4f7f0] text-[#1aab6d]',
    rejected: 'bg-red-50 text-red-500',
    distributor_assigned: 'bg-violet-50 text-violet-600',
    pickup_started: 'bg-blue-50 text-blue-500',
    picked_up: 'bg-blue-50 text-blue-500',
    en_route: 'bg-blue-50 text-blue-600',
    delivered: 'bg-[#e4f7f0] text-[#1aab6d]',
    completed: 'bg-[#e4f7f0] text-[#1aab6d]',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function NotifCard({ n, onRead }) {
  const cfg = getCfg(n.type);
  const Icon = cfg.icon;
  const unread = !n.readStatus;
  const req = n.relatedRequest;

  return (
    <div
      onClick={() => unread && onRead(n._id)}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${unread
          ? 'bg-white border-[#37d38e]/25 shadow-sm hover:shadow-md cursor-pointer group'
          : 'bg-gray-50/60 border-gray-100'
        }`}
    >
      {unread && <div className={`absolute left-0 top-0 h-full w-1 ${cfg.bar}`} />}

      <div className={`p-4 ${unread ? 'pl-5' : ''}`}>
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-black leading-tight ${unread ? 'text-[#2a3441]' : 'text-gray-500'}`}>
                  {n.title}
                </p>
                {unread && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-[#37d38e] bg-[#e4f7f0] px-1.5 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-[#37d38e] animate-pulse" /> NEW
                  </span>
                )}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{timeAgo(n.createdAt)}</span>
            </div>

            <p className={`text-xs mt-1 leading-relaxed ${unread ? 'text-gray-600' : 'text-gray-400'}`}>
              {n.message}
            </p>
          </div>
        </div>

        {/* Request data */}
        {req && (
          <div className="mt-3 ml-12 space-y-2">
            {/* Status + quantity */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={req.status} />
              {req.quantity && (
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Qty: {req.quantity}
                </span>
              )}
              {req.deliveryFee > 0 && (
                <span className="text-[9px] font-bold text-[#37d38e] bg-[#e4f7f0] px-2 py-0.5 rounded-full">
                  ₹{req.deliveryFee} fee
                </span>
              )}
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap gap-1.5">
              <RequestChip icon={Pill} label="Medicine" value={req.medicine?.name} />
              <RequestChip icon={Building2} label="From" value={req.supplierPharmacy?.pharmacyName} />
              <RequestChip icon={ArrowRight} label="To" value={req.requesterPharmacy?.pharmacyName} />
              {req.distributor?.user?.name && (
                <RequestChip icon={User} label="Distributor" value={req.distributor.user.name} />
              )}
              {req.medicine?.category && (
                <RequestChip icon={Hash} label="Category" value={req.medicine.category} />
              )}
            </div>

            {/* Request ID */}
            <p className="text-[9px] font-mono text-gray-300">
              REQ #{String(req._id).slice(-10).toUpperCase()}
            </p>
          </div>
        )}

        {/* Timestamp + read hint */}
        <div className="flex items-center justify-between mt-3 ml-12">
          <p className="text-[9px] text-gray-300">
            {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
          {unread && (
            <p className="text-[9px] text-gray-300 group-hover:text-[#37d38e] transition-colors font-medium">
              Tap to mark read
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const { connected } = useSocket();

  const unread = notifications.filter(n => !n.readStatus);
  const read = notifications.filter(n => n.readStatus);

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#2a3441]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-[#37d38e] text-white text-[11px] font-black">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-gray-500">Stay updated on requests and deliveries</p>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${connected ? 'bg-[#e4f7f0] text-[#37d38e]' : 'bg-gray-100 text-gray-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#37d38e] animate-pulse' : 'bg-gray-300'}`} />
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNotifications()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#37d38e] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total', value: notifications.length, color: 'text-[#2a3441]', bg: 'bg-white' },
            { label: 'Unread', value: unreadCount, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]' },
            { label: 'Read', value: read.length, color: 'text-gray-400', bg: 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-3 text-center shadow-sm`}>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">New notifications appear here in real-time</p>
          {connected && (
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-[#37d38e] font-bold">
              <Zap className="w-3 h-3" /> Listening for updates…
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {unread.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-[#37d38e] uppercase tracking-widest px-1">
                Unread · {unread.length}
              </p>
              {unread.map(n => <NotifCard key={n._id} n={n} onRead={markAsRead} />)}
            </div>
          )}
          {read.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Earlier · {read.length}
              </p>
              {read.map(n => <NotifCard key={n._id} n={n} onRead={markAsRead} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
