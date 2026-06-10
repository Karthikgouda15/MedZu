import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Truck, Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function AdminDistributors() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/admin/distributors');
      setDistributors(data.data || []);
    } catch (err) {
      console.error('Failed to fetch distributors:', err);
      setDistributors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/distributors/${id}/status`, { status });
      toast.success(`Distributor marked as ${status}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Distributor', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{r.user?.name}</p>
          <p className="text-xs text-slate-500">{r.user?.email}</p>
        </div>
      </div>
    )},
    { key: 'vehicle', label: 'Vehicle', render: (r) => (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
        {r.vehicleType === 'bike' ? '🏍️' : r.vehicleType === 'car' ? '🚗' : '🚚'} {r.vehicleType}
      </span>
    )},
    { key: 'earnings', label: 'Total Earnings', render: (r) => (
      <span className="font-bold text-emerald-600">₹{r.totalEarnings || 0}</span>
    )},
    { key: 'deliveries', label: 'Completed', render: (r) => (
      <span className="font-medium text-slate-700">{r.completedDeliveries || 0}</span>
    )},
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
        r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        r.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-rose-50 text-rose-700 border-rose-200'
      }`}>
        {r.status === 'active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
         r.status === 'pending' ? <ShieldAlert className="h-3.5 w-3.5" /> : 
         <X className="h-3.5 w-3.5" />}
        <span className="capitalize">{r.status}</span>
      </span>
    )},
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          {r.status !== 'active' && (
            <button
              onClick={() => updateStatus(r._id, 'active')}
              className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {r.status !== 'rejected' && r.status !== 'pending' && (
            <button
              onClick={() => updateStatus(r._id, 'rejected')}
              className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100"
              title="Reject/Deactivate"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Distributors" subtitle="Manage delivery personnel and their approval status" />
      <DataTable columns={columns} data={distributors} emptyIcon={Truck} emptyMessage="No distributors found" />
    </div>
  );
}
