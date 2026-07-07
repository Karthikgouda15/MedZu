import { useEffect, useState, useMemo } from 'react';
import {
  Send, MapPin, Truck,
  RefreshCw, Zap, WifiOff, Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'distributor_assigned', label: 'Assigned' },
  { key: 'pickup_started', label: 'Pickup' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'en_route', label: 'En Route' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_CONFIG = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  accepted: { bg: 'bg-[#e4f7f0]', text: 'text-[#37d38e]', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]' },
  distributor_assigned: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400', bar: 'bg-violet-400' },
  pickup_started: { bg: 'bg-blue-50', text: 'text-blue-500', dot: 'bg-blue-400', bar: 'bg-blue-400' },
  picked_up: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', bar: 'bg-blue-500' },
  en_route: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400', bar: 'bg-indigo-500' },
  delivered: { bg: 'bg-[#e4f7f0]', text: 'text-[#37d38e]', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]' },
  completed: { bg: 'bg-[#e4f7f0]', text: 'text-[#37d38e]', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]' },
  rejected: { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400', bar: 'bg-red-400' },
};

function LiveBadge({ connected }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-[#e4f7f0] text-[#37d38e]' : 'bg-gray-100 text-gray-400'
      }`}>
      {connected
        ? <><span className="w-1.5 h-1.5 rounded-full bg-[#37d38e] animate-pulse" />Live</>
        : <><WifiOff className="w-3 h-3" />Offline</>}
    </div>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const label = (status || 'pending').replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label.toUpperCase()}
    </span>
  );
}

function ProgressBar({ status }) {
  if (status === 'rejected') return (
    <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Request rejected
    </div>
  );
  const idx = STATUS_FLOW.findIndex(s => s.key === status);
  const STEPS = STATUS_FLOW.slice(0, 6);
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= idx ? 'bg-[#37d38e]' : 'bg-gray-100'
              }`}
          />
        ))}
      </div>
      <p className="text-[9px] text-gray-400 font-semibold">
        {STEPS[Math.min(idx, STEPS.length - 1)]?.label || 'Pending'}
        {idx < STEPS.length - 1 && <span className="text-gray-300"> → {STEPS[idx + 1]?.label}</span>}
      </p>
    </div>
  );
}

function OutgoingCard({ req }) {
  const supplier = req.supplierPharmacy;
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const initial = supplier?.pharmacyName?.charAt(0)?.toUpperCase() || '?';

  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    Promise.resolve().then(() => {
      const diff = Date.now() - new Date(req.createdAt).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) setTimeAgo('Just now');
      else if (m < 60) setTimeAgo(`${m}m ago`);
      else {
        const h = Math.floor(m / 60);
        if (h < 24) setTimeAgo(`${h}h ago`);
        else setTimeAgo(`${Math.floor(h / 24)}d ago`);
      }
    });
  }, [req.createdAt]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#37d38e]/30 transition-all duration-300 overflow-hidden">
      <div className={`h-1 w-full ${cfg.bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-teal-700">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Supplier</p>
              <p className="font-bold text-[#2a3441] text-sm truncate">
                {supplier?.pharmacyName || 'Unknown Supplier'}
              </p>
              {supplier?.address?.city && (
                <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {supplier.address.city}
                </p>
              )}
            </div>
          </div>
          <StatusPill status={req.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="col-span-1 bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Medicine</p>
            <p className="text-xs font-black text-[#2a3441] mt-0.5 truncate px-1" title={req.medicine?.name}>
              {req.medicine?.name || req.medicineName || '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Qty</p>
            <p className="text-sm font-black text-[#2a3441] mt-0.5">{req.quantity}</p>
            <p className="text-[9px] text-gray-400">units</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Requested</p>
            <p className="text-xs font-bold text-gray-500 mt-0.5">{timeAgo}</p>
          </div>
        </div>

        <ProgressBar status={req.status} />

        {req.distributor && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-xl">
            <Truck className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            <span className="text-xs text-violet-700 font-semibold">
              {req.distributor?.name || 'Distributor'} assigned for delivery
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const FILTERS = ['All', 'Active', 'Completed', 'Rejected'];

export default function PharmacyOutgoing() {
  const { connected, subscribe } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [liveFlash, setLiveFlash] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get('/pharmacy/requests/outgoing?limit=1000');
      setRequests(data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  useEffect(() => {
    const events = ['request_accepted', 'request_rejected', 'distributor_assigned', 'pickup_started', 'medicine_picked', 'delivery_started', 'delivery_completed'];
    const unsubs = events.map(e => subscribe(e, (data) => {
      setRequests(prev => prev.map(r =>
        r._id === data?._id ? { ...r, ...data } : r
      ));
      setLiveFlash('Order status updated');
      setTimeout(() => setLiveFlash(null), 3000);
      loadData(true);
    }));
    return () => unsubs.forEach(u => u());
  }, [subscribe]);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return requests;
    if (statusFilter === 'Active') return requests.filter(r => !['completed', 'rejected'].includes(r.status));
    if (statusFilter === 'Completed') return requests.filter(r => r.status === 'completed');
    if (statusFilter === 'Rejected') return requests.filter(r => r.status === 'rejected');
    return requests;
  }, [requests, statusFilter]);

  const activeCount = requests.filter(r => !['completed', 'rejected'].includes(r.status)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-5 relative">
      {liveFlash && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#2a3441] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl">
          <Zap className="w-3.5 h-3.5 text-[#37d38e]" />
          {liveFlash}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#2a3441]">Outgoing Requests</h1>
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#37d38e] text-white text-[11px] font-black">
                {activeCount}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Track the progress of your procurement orders</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge connected={connected} />
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: requests.length, color: 'text-[#2a3441]', bg: 'bg-white' },
          { label: 'Active', value: activeCount, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]' },
          { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${statusFilter === f
                ? 'bg-[#2a3441] text-white border-[#2a3441]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#2a3441]/30'
              }`}
          >
            {f}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">No outgoing requests</p>
          <p className="text-sm text-gray-400 mt-1">Search medicine and place orders to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(req => (
            <OutgoingCard key={req._id} req={req} />
          ))}
        </div>
      )}
    </div>
  );
}
