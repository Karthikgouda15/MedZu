import { useEffect, useState } from 'react';
import { History, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function DistributorHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/distributor/history')
      .then(({ data }) => {
        setHistory(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch distributor history:', err);
        setHistory([]);
        setLoading(false);
      });
  }, []);

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.medicine?.name}</p>
        <p className="text-xs text-slate-500">Qty: {r.quantity}</p>
      </div>
    )},
    { key: 'route', label: 'Route', render: (r) => (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-slate-700 truncate max-w-[120px]" title={r.supplierPharmacy?.pharmacyName}>
          {r.supplierPharmacy?.pharmacyName}
        </span>
        <ArrowRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
        <span className="font-medium text-slate-700 truncate max-w-[120px]" title={r.requesterPharmacy?.pharmacyName}>
          {r.requesterPharmacy?.pharmacyName}
        </span>
      </div>
    )},
    { key: 'fee', label: 'Fee', render: (r) => (
      <span className="font-bold text-emerald-600">₹{r.deliveryFee || 0}</span>
    )},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'date', label: 'Date', render: (r) => (
      <span className="text-sm text-slate-500">{new Date(r.updatedAt).toLocaleDateString()}</span>
    )},
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery History" subtitle="Record of all your past deliveries" />
      <DataTable columns={columns} data={history} emptyIcon={History} emptyMessage="No delivery history found." />
    </div>
  );
}
