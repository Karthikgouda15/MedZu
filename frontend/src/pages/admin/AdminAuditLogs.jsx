import { useEffect, useState } from 'react';
import { Shield, User, Clock, CheckCircle2, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/admin/audit-logs?page=${page}&limit=20`)
      .then(({ data }) => {
        setLogs(data.data || []);
        if (data.pagination) setTotalPages(data.pagination.pages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch audit logs:', err);
        setLogs([]);
        setLoading(false);
      });
  }, [page]);

  const getActionIcon = (action) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) return <User className="h-4 w-4 text-blue-500" />;
    if (action.includes('CREATE') || action.includes('ACCEPT')) return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (action.includes('REJECT') || action.includes('FAIL')) return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    return <ArrowRightCircle className="h-4 w-4 text-slate-500" />;
  };

  const columns = [
    { key: 'action', label: 'Action', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          {getActionIcon(r.action)}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">{r.action}</p>
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Clock className="h-3 w-3" /> {new Date(r.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    )},
    { key: 'user', label: 'User / Entity', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.user?.name || r.user?.email || 'System'}</p>
        {r.user?.role && <p className="text-xs capitalize text-slate-500">{r.user.role}</p>}
      </div>
    )},
    { key: 'details', label: 'Details', render: (r) => (
      <div className="max-w-md">
        <p className="text-sm text-slate-600 line-clamp-2">{r.details}</p>
        <p className="text-xs font-mono text-slate-400 mt-1">IP: {r.ipAddress}</p>
      </div>
    )},
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="System-wide activity and security logs" />
      
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <DataTable columns={columns} data={logs} emptyIcon={Shield} emptyMessage="No audit logs found" />
        
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p className="text-sm font-medium text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage((p) => p + 1)} 
              disabled={logs.length < 20}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
