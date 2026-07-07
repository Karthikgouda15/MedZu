import { useEffect, useState } from 'react';
import {
  Shield, User, Clock, CheckCircle2, AlertTriangle,
  ArrowRightCircle, LogIn, RefreshCw, Search, Filter,
  Trash2, Edit3, Plus, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ACTION_CONFIG = {
  LOGIN: { color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400', icon: LogIn },
  REGISTER: { color: 'text-violet-500', bg: 'bg-violet-50', dot: 'bg-violet-400', icon: User },
  CREATE: { color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]', dot: 'bg-[#37d38e]', icon: Plus },
  ACCEPT: { color: 'text-[#37d38e]', bg: 'bg-[#e4f7f0]', dot: 'bg-[#37d38e]', icon: CheckCircle2 },
  UPDATE: { color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-400', icon: Edit3 },
  REJECT: { color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400', icon: X },
  DELETE: { color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400', icon: Trash2 },
  FAIL: { color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400', icon: AlertTriangle },
};

const getConfig = (action = '') => {
  const key = Object.keys(ACTION_CONFIG).find(k => action.toUpperCase().includes(k));
  return ACTION_CONFIG[key] || { color: 'text-gray-400', bg: 'bg-gray-100', dot: 'bg-gray-400', icon: ArrowRightCircle };
};

const FILTERS = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'ACCEPT', 'REJECT'];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function LogRow({ log, isLast }) {
  const cfg = getConfig(log.action);
  const Icon = cfg.icon;

  return (
    <div className="flex gap-4 group">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center z-10`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-5 ${isLast ? '' : ''}`}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} uppercase tracking-wide`}>
                {log.action}
              </span>
              {log.entityType && (
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {log.entityType}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span title={new Date(log.createdAt).toLocaleString('en-IN')}>
                {timeAgo(log.createdAt)}
              </span>
              <span className="text-gray-200">·</span>
              <span>{new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-3 flex-wrap">
            {/* Actor */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#e4f7f0] flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-[#37d38e]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2a3441] truncate">
                  {log.actor?.name || log.actor?.email || log.user?.name || log.user?.email || 'System'}
                </p>
                {(log.actor?.role || log.user?.role) && (
                  <p className="text-[9px] text-gray-400 capitalize">{log.actor?.role || log.user?.role}</p>
                )}
              </div>
            </div>

            {/* Details */}
            {log.details && (
              <div className="flex-1 min-w-0 bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-500 line-clamp-2">{
                  typeof log.details === 'string'
                    ? log.details
                    : JSON.stringify(log.details)
                }</p>
              </div>
            )}
          </div>

          {/* Footer meta */}
          {(log.ipAddress || log.entityId) && (
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {log.ipAddress && (
                <span className="text-[10px] font-mono text-gray-300">IP: {log.ipAddress}</span>
              )}
              {log.entityId && (
                <span className="text-[10px] font-mono text-gray-300">
                  Ref: {String(log.entityId).slice(-8).toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const load = async (p = page, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get(`/admin/audit-logs?page=${p}&limit=20`);
      setLogs(data.data || []);
      if (data.pagination) setTotalPages(data.pagination.pages);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.action?.toLowerCase().includes(q) ||
      l.actor?.name?.toLowerCase().includes(q) ||
      l.actor?.email?.toLowerCase().includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      String(l.details || '').toLowerCase().includes(q);
    const matchFilter = filter === 'ALL' || l.action?.toUpperCase().includes(filter);
    return matchSearch && matchFilter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#2a3441]">Audit Logs</h1>
            {logs.length > 0 && (
              <span className="text-xs font-black bg-[#e4f7f0] text-[#37d38e] px-2 py-0.5 rounded-full">
                {logs.length} entries
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">System-wide activity and security trail</p>
        </div>
        <button
          onClick={() => load(page, true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search action, user, details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-[#2a3441] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#37d38e]/30 focus:border-[#37d38e] transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => {
            const cfg = getConfig(f);
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${filter === f
                    ? `${cfg.bg} ${cfg.color} shadow-sm`
                    : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
              >
                {f !== 'ALL' && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">No logs found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? `No results for "${search}"` : 'No activity recorded yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-0">
            {filtered.map((log, i) => (
              <LogRow key={log._id} log={log} isLast={i === filtered.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
          <p className="text-xs font-semibold text-gray-400">
            Page <span className="text-[#2a3441] font-black">{page}</span> of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${p === page
                        ? 'bg-[#37d38e] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || logs.length < 20}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
