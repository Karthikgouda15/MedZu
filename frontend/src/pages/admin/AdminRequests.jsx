import { useEffect, useState } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function AdminRequests() {
  const { subscribe } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    api.get('/admin/requests?limit=1000')
      .then(({ data }) => {
        setRequests(data.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch requests:', err);
      });
  };

  useEffect(() => {
    fetchRequests();
    setLoading(false);
  }, []);

  useEffect(() => {
    // Subscribe to all request-related events for real-time updates
    const events = [
      'new_request',
      'request_accepted',
      'request_rejected',
      'distributor_assigned',
      'pickup_started',
      'medicine_picked',
      'delivery_started',
      'delivery_completed',
    ];
    
    const unsubs = events.map((event) =>
      subscribe(event, () => {
        fetchRequests();
      })
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [subscribe]);

  const columns = [
    { key: 'medicine', label: 'Details', render: (r) => (
      <div>
        <p className="font-semibold text-slate-900">{r.medicine?.name} <span className="text-slate-400 font-normal">×{r.quantity}</span></p>
        <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
      </div>
    )},
    { key: 'route', label: 'Route', render: (r) => (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-teal-700 truncate max-w-[100px]" title={r.supplierPharmacy?.pharmacyName}>
          {r.supplierPharmacy?.pharmacyName}
        </span>
        <ArrowRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
        <span className="font-medium text-blue-700 truncate max-w-[100px]" title={r.requesterPharmacy?.pharmacyName}>
          {r.requesterPharmacy?.pharmacyName}
        </span>
      </div>
    )},
    { key: 'distributor', label: 'Distributor', render: (r) => (
      <span className="text-sm font-medium text-slate-700">{r.distributor?.user?.name || '-'}</span>
    )},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="All Requests" subtitle="Platform-wide view of all procurement requests" />
      <DataTable columns={columns} data={requests} emptyIcon={Package} emptyMessage="No requests found on the platform" />
    </div>
  );
}
