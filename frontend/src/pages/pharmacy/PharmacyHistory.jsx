import { useEffect, useState } from 'react';
import { History, ArrowRightLeft } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function PharmacyHistory() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get(`/pharmacy/requests?page=${page}&limit=10`)
      .then(({ data }) => {
        setRequests(data.data || []);
        if (data.pagination) setTotalPages(data.pagination.pages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch pharmacy history:', err);
        setRequests([]);
        setLoading(false);
      });
  }, [page]);

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.medicine?.name} <span className="text-slate-400 font-normal">×{r.quantity}</span></p>
        <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
      </div>
    )},
    { key: 'type', label: 'Type', render: (r) => {
      const isOutgoing = r.requesterPharmacy?._id === profile?._id;
      return (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
          isOutgoing ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
        }`}>
          <ArrowRightLeft className={`h-3 w-3 ${isOutgoing ? 'rotate-45' : '-rotate-135'}`} />
          {isOutgoing ? 'Procured' : 'Supplied'}
        </span>
      );
    }},
    { key: 'partner', label: 'Partner Pharmacy', render: (r) => {
      const isOutgoing = r.requesterPharmacy?._id === profile?._id;
      const partner = isOutgoing ? r.supplierPharmacy : r.requesterPharmacy;
      return (
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            isOutgoing ? 'bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700' : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700'
          }`}>
            {partner?.pharmacyName?.charAt(0) || '?'}
          </div>
          <span className="font-medium text-slate-700">{partner?.pharmacyName}</span>
        </div>
      );
    }},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Order History" subtitle="Complete record of all procured and supplied medicines" />
      
      <DataTable columns={columns} data={requests} emptyIcon={History} emptyMessage="No order history found" />
      
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
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
            disabled={requests.length < 10} // simplistic check if no totalPages
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
