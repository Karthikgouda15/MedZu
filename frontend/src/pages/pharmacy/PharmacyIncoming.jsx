import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Inbox, Check, X, MapPin, Clock, Phone,
  RefreshCw, Zap, WifiOff, Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';

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

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  accepted: { label: 'Accepted', bg: 'bg-[#e4f7f0]', text: 'text-[#37d38e]', border: 'border-[#37d38e]/30', dot: 'bg-[#37d38e]', bar: 'bg-[#37d38e]' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', dot: 'bg-red-400', bar: 'bg-red-400' },
  completed: { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-200', dot: 'bg-blue-400', bar: 'bg-blue-400' },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label.toUpperCase()}
    </span>
  );
}

function RequestCard({ req, onAccept, onReject, accepting, rejecting }) {
  const pharmacy = req.requesterPharmacy;
  const initial = pharmacy?.pharmacyName?.charAt(0)?.toUpperCase() || '?';
  const isPending = req.status === 'pending';
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;

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
    <div className={`relative bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${req.isNew
        ? 'ring-2 ring-[#37d38e] ring-offset-1'
        : 'border-gray-100 hover:border-[#37d38e]/30 hover:shadow-md'
      }`}>
      {req.isNew && (
        <div className="absolute top-3 right-14 z-10 flex items-center gap-1 bg-[#37d38e] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
          <Zap className="w-2.5 h-2.5" /> NEW
        </div>
      )}

      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="p-5">
        {/* From pharmacy */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-blue-700">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">From</p>
              <p className="font-bold text-[#2a3441] text-sm leading-tight truncate">
                {pharmacy?.pharmacyName || 'Unknown Pharmacy'}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {(pharmacy?.address?.city || pharmacy?.address) && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {pharmacy?.address?.city || pharmacy?.address}
                  </span>
                )}
                {pharmacy?.phone && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    {pharmacy.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <StatusPill status={req.status} />
        </div>

        {/* Medicine + qty + urgency */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="col-span-1 bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Medicine</p>
            <p className="text-xs font-black text-[#2a3441] mt-0.5 truncate px-1" title={req.medicine?.name || req.medicineName}>
              {req.medicine?.name || req.medicineName || '—'}
            </p>
            {req.medicine?.manufacturer && (
              <p className="text-[9px] text-gray-400 truncate">{req.medicine.manufacturer}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Quantity</p>
            <p className="text-sm font-black text-[#2a3441] mt-0.5">{req.quantity}</p>
            <p className="text-[9px] text-gray-400">units</p>
          </div>
          <div className={`rounded-xl p-2.5 ${req.urgency === 'High' ? 'bg-red-50' : req.urgency === 'Medium' ? 'bg-amber-50' : 'bg-gray-50'
            }`}>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Urgency</p>
            <p className={`text-xs font-black mt-0.5 ${req.urgency === 'High' ? 'text-red-500' : req.urgency === 'Medium' ? 'text-amber-600' : 'text-gray-500'
              }`}>
              {req.urgency || 'Normal'}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-4">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
          <span className="mx-1">·</span>
          <span>{new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>

        {/* Actions */}
        {isPending ? (
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(req._id)}
              disabled={accepting || rejecting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#37d38e] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm shadow-[#37d38e]/30"
            >
              {accepting
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <><Check className="w-3.5 h-3.5" /> Accept</>}
            </button>
            <button
              onClick={() => onReject(req._id)}
              disabled={accepting || rejecting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-60 border border-red-100"
            >
              {rejecting
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <><X className="w-3.5 h-3.5" /> Reject</>}
            </button>
          </div>
        ) : (
          <div className={`py-2 text-center text-xs italic rounded-xl ${req.status === 'accepted' ? 'bg-[#e4f7f0] text-[#37d38e]' : 'bg-red-50 text-red-400'
            }`}>
            {req.status === 'accepted' ? '✓ You accepted this request' : '✗ You rejected this request'}
          </div>
        )}
      </div>
    </div>
  );
}

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected'];

export default function PharmacyIncoming() {
  const { connected, subscribe } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [actioningId, setActioningId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [liveFlash, setLiveFlash] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get('/pharmacy/requests/incoming?limit=1000');
      setRequests(data.data || []);
    } catch {
      toast.error('Failed to load requests');
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
    const unsub = subscribe('new_request', (data) => {
      setRequests(prev => {
        if (prev.find(r => r._id === data?._id)) return prev;
        return [{ ...data, isNew: true }, ...prev];
      });
      setLiveFlash(`New request from ${data?.requesterPharmacy?.pharmacyName || 'a pharmacy'}`);
      setTimeout(() => setLiveFlash(null), 3500);
      loadData(true);
    });
    return unsub;
  }, [subscribe]);

  const accept = async (id) => {
    setActioningId(id);
    setActionType('accept');
    try {
      await api.patch(`/pharmacy/requests/${id}/accept`);
      toast.success('Request accepted');
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'accepted', isNew: false } : r));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActioningId(null);
      setActionType(null);
    }
  };

  const reject = async (id) => {
    setActioningId(id);
    setActionType('reject');
    try {
      await api.patch(`/pharmacy/requests/${id}/reject`);
      toast.success('Request rejected');
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected', isNew: false } : r));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActioningId(null);
      setActionType(null);
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter(r => r.status === statusFilter.toLowerCase());
  }, [requests, statusFilter]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-5 relative">
      {liveFlash && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#2a3441] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl">
          <Zap className="w-3.5 h-3.5 text-[#37d38e]" />
          {liveFlash}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#2a3441]">Incoming Requests</h1>
            {pendingCount > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white text-[11px] font-black">
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Procurement requests from nearby pharmacies</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge connected={connected} />
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: requests.length, color: 'text-[#2a3441]', bg: 'bg-white' },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
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
            {f === 'Pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-white text-[9px] font-black">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">
            No {statusFilter !== 'All' ? statusFilter.toLowerCase() + ' ' : ''}requests
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {statusFilter === 'Pending'
              ? 'All caught up — no pending requests right now'
              : 'Nothing to show for this filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(req => (
            <RequestCard
              key={req._id}
              req={req}
              onAccept={accept}
              onReject={reject}
              accepting={actioningId === req._id && actionType === 'accept'}
              rejecting={actioningId === req._id && actionType === 'reject'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
