import { useEffect, useState, useMemo } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_CONFIG = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  accepted: { bg: 'bg-[#e4f7f0]', text: 'text-[#37d38e]', dot: 'bg-[#37d38e]' },
  rejected: { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-500', dot: 'bg-blue-400' },
  delivered: { bg: 'bg-[#e4f7f0]', text: 'text-[#37d38e]', dot: 'bg-[#37d38e]' },
  en_route: { bg: 'bg-violet-50', text: 'text-violet-500', dot: 'bg-violet-400' },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const label = status?.replace(/_/g, ' ') || 'Unknown';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} border-transparent`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label.toUpperCase()}
    </span>
  );
}

function HistoryCard({ req, profileId }) {
  const isProcured = req.requesterPharmacy?._id === profileId;
  const partner = isProcured ? req.supplierPharmacy : req.requesterPharmacy;
  const initial = partner?.pharmacyName?.charAt(0)?.toUpperCase() || '?';

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#37d38e]/30 transition-all duration-200 overflow-hidden">
      <div className={`h-0.5 w-full ${isProcured ? 'bg-blue-400' : 'bg-[#37d38e]'}`} />
      <div className="p-4 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isProcured ? 'bg-blue-50 text-blue-500' : 'bg-[#e4f7f0] text-[#37d38e]'
          }`}>
          {isProcured
            ? <ArrowUpRight className="w-5 h-5" />
            : <ArrowDownLeft className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isProcured ? 'bg-blue-50 text-blue-600' : 'bg-[#e4f7f0] text-[#37d38e]'
                }`}>
                {isProcured ? 'PROCURED' : 'SUPPLIED'}
              </span>
              <p className="font-bold text-[#2a3441] text-sm mt-1">
                {req.medicine?.name || req.medicineName || '—'}
                <span className="text-gray-400 font-normal"> ×{req.quantity}</span>
              </p>
              {req.medicine?.manufacturer && (
                <p className="text-[10px] text-gray-400">{req.medicine.manufacturer}</p>
              )}
            </div>
            <StatusPill status={req.status} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${isProcured
                  ? 'bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700'
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700'
                }`}>
                {initial}
              </div>
              <span className="text-xs text-gray-600 font-semibold">{partner?.pharmacyName || 'Unknown'}</span>
            </div>
            <span className="text-gray-200">·</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            <span className="text-gray-200">·</span>
            <span className="text-[10px] text-gray-400">
              {new Date(req.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = ['All', 'Procured', 'Supplied'];

export default function PharmacyHistory() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (ignore) return;
      setLoading(true);
      api.get(`/pharmacy/requests?page=${page}&limit=20`)
        .then(({ data }) => {
          if (ignore) return;
          setRequests(data.data || []);
          if (data.pagination) setTotalPages(data.pagination.pages || 1);
        })
        .catch(() => {
          if (ignore) return;
          setRequests([]);
        })
        .finally(() => {
          if (ignore) return;
          setLoading(false);
        });
    });
    return () => {
      ignore = true;
    };
  }, [page]);

  const filtered = useMemo(() => {
    if (typeFilter === 'All') return requests;
    return requests.filter(r => {
      const isProcured = r.requesterPharmacy?._id === profile?._id;
      return typeFilter === 'Procured' ? isProcured : !isProcured;
    });
  }, [requests, typeFilter, profile]);

  const procuredCount = requests.filter(r => r.requesterPharmacy?._id === profile?._id).length;
  const suppliedCount = requests.length - procuredCount;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#2a3441]">Order History</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete record of all procured and supplied medicines</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: requests.length, color: 'text-[#2a3441]', bg: 'bg-white' },
          { label: 'Procured', value: procuredCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Supplied', value: suppliedCount, color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${typeFilter === f
                ? 'bg-[#2a3441] text-white border-[#2a3441]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#2a3441]/30'
              }`}
          >
            {f}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} records</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">No history found</p>
          <p className="text-sm text-gray-400 mt-1">Orders will appear here once completed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <HistoryCard key={req._id} req={req} profileId={profile?._id} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
