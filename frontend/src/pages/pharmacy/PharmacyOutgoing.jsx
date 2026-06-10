import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

const STATUS_FLOW = ['pending', 'accepted', 'distributor_assigned', 'pickup_started', 'picked_up', 'en_route', 'delivered', 'completed'];

export default function PharmacyOutgoing() {
  const { subscribe } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/pharmacy/requests/outgoing');
      setRequests(data.data || []);
    } catch (err) {
      console.error('Failed to fetch outgoing requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const events = ['request_accepted', 'request_rejected', 'distributor_assigned', 'pickup_started', 'medicine_picked', 'delivery_started', 'delivery_completed'];
    const unsubs = events.map((e) => subscribe(e, fetch));
    return () => unsubs.forEach((u) => u());
  }, [subscribe]);

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.medicine?.name} <span className="text-slate-400 font-normal">×{r.quantity}</span></p>
        <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
      </div>
    )},
    { key: 'supplier', label: 'Supplier', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-xs font-bold text-teal-700">
          {r.supplierPharmacy?.pharmacyName?.charAt(0)}
        </div>
        <span className="font-medium text-slate-700">{r.supplierPharmacy?.pharmacyName}</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'progress',
      label: 'Delivery Progress',
      render: (r) => {
        if (r.status === 'rejected') return <span className="text-xs text-rose-500 italic">Request rejected</span>;
        
        const idx = STATUS_FLOW.indexOf(r.status);
        const steps = STATUS_FLOW.slice(0, 5); // Simplify to 5 steps visually
        
        return (
          <div className="flex w-32 gap-1 sm:w-48">
            {steps.map((s, i) => {
              const isCompleted = i <= Math.min(idx, 4);
              const isCurrent = i === Math.min(idx, 4);
              return (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-primary-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                      : 'bg-slate-100'
                  }`}
                />
              );
            })}
          </div>
        );
      },
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Outgoing Requests" subtitle="Track the progress of your procurement requests" />
      <DataTable columns={columns} data={requests} emptyIcon={Send} emptyMessage="No outgoing requests yet" />
    </div>
  );
}
