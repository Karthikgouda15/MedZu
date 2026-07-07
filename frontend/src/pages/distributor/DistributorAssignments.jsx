import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ClipboardList, Check, X, MapPin, Package,
  Clock, DollarSign, RefreshCw, Zap, WifiOff, ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const addrStr = (addr) => {
  if (!addr) return '—';
  if (typeof addr === 'string') return addr;
  return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
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

function AssignmentCard({ req, onAccept, onReject, accepting, rejecting }) {
  const timeAgo = (() => {
    const diff = Date.now() - new Date(req.createdAt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#37d38e]/30 transition-all duration-300 overflow-hidden">
      <div className="h-1 w-full bg-amber-400" />
      <div className="p-5">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-100 mb-1.5">
              <Zap className="w-2.5 h-2.5" /> PENDING
            </span>
            <h3 className="font-black text-[#2a3441] text-base leading-tight">
              {req.medicine?.name || 'Medicine Delivery'}
            </h3>
            {req.medicine?.manufacturer && (
              <p className="text-[11px] text-gray-400 mt-0.5">{req.medicine.manufacturer}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Est. Earnings</p>
            <p className="text-xl font-black text-[#37d38e]">₹{req.deliveryFee || '—'}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Quantity</p>
            <p className="text-sm font-black text-[#2a3441] mt-0.5">{req.quantity}</p>
            <p className="text-[9px] text-gray-400">units</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Category</p>
            <p className="text-xs font-bold text-[#2a3441] mt-0.5 truncate px-1">
              {req.medicine?.category || 'General'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Received</p>
            <p className="text-xs font-bold text-gray-500 mt-0.5">{timeAgo}</p>
          </div>
        </div>

        {/* Route */}
        <div className="rounded-xl border border-gray-100 overflow-hidden mb-4">
          <div className="flex items-start gap-3 p-3 bg-[#e4f7f0]/40">
            <div className="w-7 h-7 rounded-lg bg-[#e4f7f0] flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#37d38e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-[#37d38e] font-black uppercase tracking-widest mb-0.5">Pickup From</p>
              <p className="font-bold text-[#2a3441] text-sm truncate">
                {req.supplierPharmacy?.pharmacyName || '—'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{addrStr(req.supplierPharmacy?.address)}</p>
              {req.supplierPharmacy?.phone && (
                <p className="text-[10px] text-gray-400">{req.supplierPharmacy.phone}</p>
              )}
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-start gap-3 p-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-0.5">Deliver To</p>
              <p className="font-bold text-[#2a3441] text-sm truncate">
                {req.requesterPharmacy?.pharmacyName || '—'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{addrStr(req.requesterPharmacy?.address)}</p>
              {req.requesterPharmacy?.phone && (
                <p className="text-[10px] text-gray-400">{req.requesterPharmacy.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional info row */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          {req.commission > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              <DollarSign className="w-2.5 h-2.5" /> Commission ₹{req.commission}
            </span>
          )}
          {req.medicine?.requiresPrescription && (
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              Rx Required
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold ml-auto">
            <Clock className="w-3 h-3" />
            {new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(req._id)}
            disabled={accepting || rejecting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#37d38e] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm shadow-[#37d38e]/30"
          >
            {accepting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <><Check className="w-4 h-4" /> Accept</>}
          </button>
          <button
            onClick={() => onReject(req._id)}
            disabled={accepting || rejecting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-60 border border-red-100"
          >
            {rejecting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <><X className="w-4 h-4" /> Reject</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DistributorAssignments() {
  const { connected, subscribe } = useSocket();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [liveFlash, setLiveFlash] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get('/distributor/assignments?limit=1000');
      setAssignments(data.data || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const unsub = subscribe('distributor_assigned', (data) => {
      setAssignments(prev => {
        if (prev.find(r => r._id === data?._id)) return prev;
        return [data, ...prev];
      });
      setLiveFlash('New delivery request assigned!');
      setTimeout(() => setLiveFlash(null), 3500);
      loadData(true);
    });
    return unsub;
  }, [subscribe]);

  const accept = async (id) => {
    setActioningId(id);
    setActionType('accept');
    try {
      await api.patch(`/distributor/requests/${id}/respond`, { accept: true });
      toast.success('Assignment accepted!');
      navigate('/distributor/active');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      setActioningId(null);
      setActionType(null);
    }
  };

  const reject = async (id) => {
    setActioningId(id);
    setActionType('reject');
    try {
      await api.patch(`/distributor/requests/${id}/respond`, { accept: false });
      toast.success('Assignment rejected');
      setAssignments(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActioningId(null);
      setActionType(null);
    }
  };

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
            <h1 className="text-xl font-black text-[#2a3441]">Pending Assignments</h1>
            {assignments.length > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white text-[11px] font-black">
                {assignments.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">New delivery requests waiting for your acceptance</p>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: assignments.length, color: 'text-[#2a3441]', bg: 'bg-white' },
          { label: 'Pending', value: assignments.length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Est. Total', value: `₹${assignments.reduce((s, r) => s + (r.deliveryFee || 0), 0)}`, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">No pending assignments</p>
          <p className="text-sm text-gray-400 mt-1">New delivery requests will appear here in real-time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(req => (
            <AssignmentCard
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
