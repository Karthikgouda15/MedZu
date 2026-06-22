import { useEffect, useState } from 'react';
import { Building2, Truck, Pill, Package, CheckCircle, Activity } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import LiveDistributorsMap from '../../components/LiveDistributorsMap';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="mt-1 text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { subscribe } = useSocket();
  const [analytics, setAnalytics] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/distributors/live'),
    ]).then(([a, d]) => {
      setAnalytics(a.data.data);
      setDistributors(d.data.data);
    }).catch((err) => {
      console.error('Failed to fetch dashboard data:', err);
    });
  };

  useEffect(() => {
    fetchDashboardData();
    setLoading(false);
  }, []);

  useEffect(() => {
    // Subscribe to request status changes for real-time analytics updates
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
        fetchDashboardData();
      })
    );

    // Subscribe to location updates for live distributor map
    const locationUnsub = subscribe('location_updated', () => {
      api.get('/admin/distributors/live')
        .then(({ data }) => setDistributors(data.data))
        .catch((err) => console.error('Failed to fetch live distributors:', err));
    });

    return () => {
      unsubs.forEach((u) => u());
      locationUnsub();
    };
  }, [subscribe]);

  if (loading) return <LoadingSpinner />;

  const t = analytics?.totals || {};

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="animate-fade-in-up stagger-1"><StatCard title="Pharmacies" value={t.pharmacies} icon={Building2} /></div>
        <div className="animate-fade-in-up stagger-2"><StatCard title="Distributors" value={t.distributors} icon={Truck} color="blue" /></div>
        <div className="animate-fade-in-up stagger-3"><StatCard title="Medicines" value={t.medicines} icon={Pill} color="amber" /></div>
        <div className="animate-fade-in-up stagger-4"><StatCard title="Total Requests" value={t.requests} icon={Package} color="purple" /></div>
        <div className="animate-fade-in-up stagger-5"><StatCard title="Active Deliveries" value={t.activeDeliveries} icon={Activity} color="rose" /></div>
        <div className="animate-fade-in-up stagger-6"><StatCard title="Completed" value={t.completedDeliveries} icon={CheckCircle} /></div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="animate-fade-in-up card-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Monthly Requests</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics?.charts?.monthlyRequests || []}>
              <defs>
                <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Requests" stroke="#10b981" strokeWidth={2.5} fill="url(#reqGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="animate-fade-in-up card-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Revenue Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Revenue', value: analytics?.revenue?.totalRevenue, prefix: '₹', gradient: 'from-primary-500 to-teal-500' },
              { label: 'Delivery Fees', value: analytics?.revenue?.deliveryFees, prefix: '₹', gradient: 'from-blue-500 to-indigo-500' },
              { label: 'Platform Commission', value: analytics?.revenue?.commissions, prefix: '₹', gradient: 'from-amber-500 to-orange-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-lg font-bold text-slate-900">{item.prefix}{(item.value || 0).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 p-4 border border-primary-100">
              <span className="text-sm font-medium text-primary-700">Success Rate</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 rounded-full bg-primary-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all" style={{ width: `${t.successRate || 0}%` }} />
                </div>
                <span className="text-lg font-bold text-primary-700">{t.successRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Live Distributor Map</h3>
        <div className="overflow-hidden rounded-xl">
          <LiveDistributorsMap distributors={distributors} height="450px" />
        </div>
      </div>
    </div>
  );
}
