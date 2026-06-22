import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Building2, Search, Check, X, ShieldAlert, CheckCircle2,
  XCircle, Phone, Mail, Hash, MapPin, Calendar, RefreshCw,
  User, ChevronRight, ArrowLeft, Clock, FileText, Globe,
  Activity, Loader2, TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const addrStr = (addr) => {
  if (!addr) return '—';
  if (typeof addr === 'string') return addr;
  return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
};

const STATUS_CONFIG = {
  active: { label: 'Active', dot: 'bg-[#37d38e]', pill: 'bg-[#e4f7f0] text-[#1aab6d]', border: 'border-[#37d38e]/30', bar: 'bg-[#37d38e]' },
  pending: { label: 'Pending', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600', border: 'border-amber-200', bar: 'bg-amber-400' },
  rejected: { label: 'Rejected', dot: 'bg-red-400', pill: 'bg-red-50 text-red-500', border: 'border-red-200', bar: 'bg-red-400' },
  inactive: { label: 'Inactive', dot: 'bg-gray-300', pill: 'bg-gray-100 text-gray-400', border: 'border-gray-200', bar: 'bg-gray-300' },
};

const FILTERS = ['all', 'pending', 'active', 'rejected'];

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      <p className="text-2xl font-black" style={{ color: accent || '#2a3441' }}>{value}</p>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-[#37d38e] uppercase tracking-widest mb-3">{title}</p>
      <div className="bg-gray-50/80 rounded-2xl overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, highlight, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3.5 px-4 py-3">
      <Icon className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">{label}</span>
        <span className={`text-xs font-bold text-right break-all ${highlight ? 'text-[#37d38e]' : mono ? 'font-mono text-gray-500' : 'text-[#2a3441]'
          }`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function PharmacyDetailModal({ pharmacyId, initialData, onClose, onStatusChange, actioning }) {
  const [detail, setDetail] = useState(initialData);
  const [fetching, setFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDetail = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/pharmacies/${pharmacyId}`);
      setDetail(data.data);
      setLastUpdated(new Date());
    } catch {
      // keep stale
    } finally {
      setFetching(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetchDetail();
    const iv = setInterval(fetchDetail, 10000);
    return () => clearInterval(iv);
  }, [fetchDetail]);

  const cfg = STATUS_CONFIG[detail?.status] || STATUS_CONFIG.inactive;

  const joinDate = detail?.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : null;
  const lastEdit = detail?.updatedAt ? new Date(detail.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null;
  const userSince = detail?.user?.createdAt ? new Date(detail.user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null;

  const coords = detail?.location?.coordinates
    ? `${detail.location.coordinates[1]?.toFixed(5)}, ${detail.location.coordinates[0]?.toFixed(5)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Color bar */}
        <div className={`h-1 w-full flex-shrink-0 ${cfg.bar} transition-colors duration-300`} />

        {/* Top nav */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#2a3441] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] text-gray-300">
                {lastUpdated.toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </span>
            )}
            <button
              onClick={fetchDetail}
              disabled={fetching}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 text-gray-400 ${fetching ? 'animate-spin' : ''}`} />
            </button>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${cfg.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${detail?.status === 'active' ? 'animate-pulse' : ''}`} />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-2 space-y-5">
          {fetching && !detail ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#37d38e]" />
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 rounded-2xl bg-[#e4f7f0] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-[#37d38e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-[#2a3441] leading-snug">{detail?.pharmacyName}</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{detail?._id?.toUpperCase()}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Requests', value: detail?.requestCount ?? '—', color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]' },
                  { label: 'Status', value: detail?.status === 'active' ? 'Online' : 'Offline', color: detail?.status === 'active' ? 'text-[#37d38e]' : 'text-gray-400', bg: 'bg-gray-50' },
                  { label: 'Role', value: 'Pharmacy', color: 'text-[#2a3441]', bg: 'bg-gray-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <Section title="Contact & Identity">
                <InfoRow icon={User} label="Owner" value={detail?.ownerName || detail?.user?.name} />
                <InfoRow icon={Mail} label="Email" value={detail?.user?.email} />
                <InfoRow icon={Phone} label="Phone" value={detail?.phone || detail?.user?.phone} />
                <InfoRow icon={Hash} label="License" value={detail?.licenseNumber} highlight />
                <InfoRow icon={FileText} label="GST" value={detail?.gstNumber} mono />
                <InfoRow icon={Globe} label="Website" value={detail?.website} />
              </Section>

              {/* Location */}
              <Section title="Location">
                <InfoRow icon={MapPin} label="Street" value={detail?.address?.street || (typeof detail?.address === 'string' ? detail.address : null)} />
                <InfoRow icon={MapPin} label="City" value={detail?.address?.city} />
                <InfoRow icon={MapPin} label="State" value={detail?.address?.state} />
                <InfoRow icon={MapPin} label="Pincode" value={detail?.address?.pincode || detail?.pincode} />
                <InfoRow icon={Activity} label="Coords" value={coords} mono />
              </Section>

              {/* Account */}
              <Section title="Account">
                <InfoRow icon={Calendar} label="Registered" value={joinDate} />
                <InfoRow icon={Clock} label="Last Updated" value={lastEdit} />
                <InfoRow icon={User} label="User Since" value={userSince} />
                <InfoRow icon={Activity} label="Account" value={detail?.user?.status?.toUpperCase()} />
                <InfoRow icon={FileText} label="Notes" value={detail?.notes} />
              </Section>

              <div className="h-1" />
            </>
          )}
        </div>

        {/* Action footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <div className="flex gap-2">
            {detail?.status !== 'active' && (
              <button
                onClick={() => onStatusChange(detail._id, 'active', 'approve')}
                disabled={!!actioning}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#37d38e] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {actioning === 'approve'
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <><Check className="w-4 h-4" /> Approve</>}
              </button>
            )}
            {detail?.status !== 'rejected' && (
              <button
                onClick={() => onStatusChange(detail._id, 'rejected', 'reject')}
                disabled={!!actioning}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-red-100 bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                {actioning === 'reject'
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <><X className="w-4 h-4" /> {detail?.status === 'active' ? 'Deactivate' : 'Reject'}</>}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyCard({ pharmacy, onClick, onApprove, onReject, actioning }) {
  const cfg = STATUS_CONFIG[pharmacy.status] || STATUS_CONFIG.inactive;
  const joinDate = pharmacy.createdAt
    ? new Date(pharmacy.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div
      className={`bg-white rounded-2xl border ${cfg.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group`}
      onClick={onClick}
    >
      <div className={`h-1 w-full ${cfg.bar}`} />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#e4f7f0] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#37d38e]" />
            </div>
            <div>
              <h3 className="font-black text-[#2a3441] text-sm leading-tight group-hover:text-[#37d38e] transition-colors">
                {pharmacy.pharmacyName}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">#{pharmacy._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${cfg.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#37d38e] transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { Icon: Mail, val: pharmacy.user?.email, label: 'Email' },
            { Icon: Phone, val: pharmacy.phone || pharmacy.user?.phone, label: 'Phone' },
            { Icon: Hash, val: pharmacy.licenseNumber, label: 'License' },
            { Icon: Calendar, val: joinDate, label: 'Registered' },
          ].map(({ Icon: I, val, label }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <I className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-xs font-bold text-[#2a3441] truncate">{val || '—'}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-2.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Address</p>
            <p className="text-xs text-[#2a3441] font-medium leading-relaxed line-clamp-2">{addrStr(pharmacy.address)}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-1" onClick={e => e.stopPropagation()}>
          {pharmacy.status !== 'active' && (
            <button
              onClick={() => onApprove(pharmacy._id)}
              disabled={!!actioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#37d38e] text-white text-xs font-bold hover:opacity-90 disabled:opacity-60 transition-opacity shadow-sm"
            >
              {actioning === 'approve'
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <><Check className="w-3.5 h-3.5" /> Approve</>}
            </button>
          )}
          {pharmacy.status !== 'rejected' && (
            <button
              onClick={() => onReject(pharmacy._id)}
              disabled={!!actioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 disabled:opacity-60 transition-colors border border-red-100"
            >
              {actioning === 'reject'
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <><X className="w-3.5 h-3.5" /> {pharmacy.status === 'active' ? 'Deactivate' : 'Reject'}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actioningId, setActioningId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get('/admin/pharmacies?limit=1000');
      setPharmacies(data.data || []);
    } catch (err) {
      if (!silent) setPharmacies([]);
      else toast.error(err.response?.data?.message || 'Refresh failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id, status, type) => {
    setActioningId(id);
    setActionType(type);
    try {
      await api.patch(`/admin/pharmacies/${id}/status`, { status });
      toast.success(`Pharmacy ${status}`);
      setPharmacies(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setActioningId(null);
      setActionType(null);
    }
  };

  const filtered = pharmacies.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.pharmacyName?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.licenseNumber?.toLowerCase().includes(q) ||
      addrStr(p.address).toLowerCase().includes(q);
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: pharmacies.length,
    pending: pharmacies.filter(p => p.status === 'pending').length,
    active: pharmacies.filter(p => p.status === 'active').length,
    rejected: pharmacies.filter(p => p.status === 'rejected').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {selected && (
        <PharmacyDetailModal
          pharmacyId={selected._id}
          initialData={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
          actioning={actioningId === selected._id ? actionType : null}
        />
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#2a3441]">Pharmacy Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review, approve, and manage registered pharmacies</p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={counts.all} sub="All registered" accent="#2a3441" />
        <StatCard label="Pending" value={counts.pending} sub="Awaiting review" accent="#d97706" />
        <StatCard label="Active" value={counts.active} sub="Approved & operating" accent="#37d38e" />
        <StatCard label="Rejected" value={counts.rejected} sub="Denied or deactivated" accent="#ef4444" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, license, address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-[#2a3441] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#37d38e]/30 focus:border-[#37d38e] transition-all"
          />
        </div>
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white text-[#2a3441] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f}
              {counts[f] > 0 && (
                <span className={`ml-1.5 text-[9px] font-black px-1 py-0.5 rounded-full ${filter === f ? 'bg-[#37d38e] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">No pharmacies found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? `No results for "${search}"` : 'No pharmacies in this category yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PharmacyCard
              key={p._id}
              pharmacy={p}
              onClick={() => setSelected(p)}
              onApprove={(id) => updateStatus(id, 'active', 'approve')}
              onReject={(id) => updateStatus(id, 'rejected', 'reject')}
              actioning={actioningId === p._id ? actionType : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
