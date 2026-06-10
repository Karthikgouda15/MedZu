import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Inbox, Check, X } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function PharmacyIncoming() {
  const { subscribe } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/pharmacy/requests/incoming');
      setRequests(data.data || []);
    } catch (err) {
      console.error('Failed to fetch incoming requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => subscribe('new_request', fetch), [subscribe]);

  const accept = async (id) => {
    try {
      await api.patch(`/pharmacy/requests/${id}/accept`);
      toast.success('Request accepted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const reject = async (id) => {
    try {
      await api.patch(`/pharmacy/requests/${id}/reject`);
      toast.success('Request rejected');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.medicine?.name}</p>
        <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
      </div>
    )},
    { key: 'qty', label: 'Qty', render: (r) => (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
        {r.quantity}
      </span>
    )},
    { key: 'requester', label: 'Requested By', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700">
          {r.requesterPharmacy?.pharmacyName?.charAt(0)}
        </div>
        <span className="font-medium text-slate-700">{r.requesterPharmacy?.pharmacyName}</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex gap-2">
            <button 
              onClick={() => accept(r._id)} 
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <Check className="h-3.5 w-3.5" /> Accept
            </button>
            <button 
              onClick={() => reject(r._id)} 
              className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            >
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No actions available</span>
        ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Incoming Requests" subtitle="Manage procurement requests from other pharmacies" />
      <DataTable columns={columns} data={requests} emptyIcon={Inbox} emptyMessage="No pending incoming requests" />
    </div>
  );
}
