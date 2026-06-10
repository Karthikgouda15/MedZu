import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, Check, X, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function DistributorAssignments() {
  const { subscribe } = useSocket();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/distributor/assignments');
      setAssignments(data.data || []);
    } catch (err) {
      console.error('Failed to fetch distributor assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => subscribe('distributor_assigned', fetch), [subscribe]);

  const respond = async (id, accept) => {
    try {
      await api.patch(`/distributor/requests/${id}/respond`, { accept });
      toast.success(accept ? 'Assignment accepted! Head to Active Delivery.' : 'Assignment rejected');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.medicine?.name}</p>
        <p className="text-xs text-slate-500">Qty: {r.quantity}</p>
      </div>
    )},
    { key: 'from', label: 'Pickup From', render: (r) => (
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-slate-900">{r.supplierPharmacy?.pharmacyName}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{r.supplierPharmacy?.address}</p>
        </div>
      </div>
    )},
    { key: 'to', label: 'Deliver To', render: (r) => (
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 text-blue-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-slate-900">{r.requesterPharmacy?.pharmacyName}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{r.requesterPharmacy?.address}</p>
        </div>
      </div>
    )},
    { key: 'fee', label: 'Est. Fee', render: (r) => (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
        ₹{r.deliveryFee || 'TBD'}
      </span>
    )},
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button 
            onClick={() => respond(r._id, true)} 
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 hover:shadow-md"
          >
            <Check className="h-3.5 w-3.5" /> Accept
          </button>
          <button 
            onClick={() => respond(r._id, false)} 
            className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
          >
            <X className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Assignments" subtitle="New delivery requests waiting for your acceptance" />
      <DataTable columns={columns} data={assignments} emptyIcon={ClipboardList} emptyMessage="No pending assignments right now." />
    </div>
  );
}
