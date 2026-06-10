import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Truck, DollarSign, ArrowRight, Zap } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DistributorDashboard() {
  const { subscribe } = useSocket();
  const [stats, setStats] = useState({ pending: 0, active: 0, earnings: 0, recent: [] });

  const load = async () => {
    try {
      const [assignments, active, earnings] = await Promise.all([
        api.get('/distributor/assignments'),
        api.get('/distributor/active'),
        api.get('/distributor/earnings'),
      ]);
      setStats({
        pending: assignments.data.data.length,
        active: active.data.data.length,
        earnings: earnings.data.data.totalEarnings,
        recent: earnings.data.data.recent || [],
      });
    } catch (err) {
      console.error('Failed to load distributor dashboard stats:', err);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => subscribe('distributor_assigned', load), [subscribe]);

  // Build mini chart data from recent deliveries
  const chartData = stats.recent.slice(0, 7).map((r, i) => ({
    name: i,
    fee: r.deliveryFee || 0,
  })).reverse();

  const quickActions = [
    { to: '/distributor/assignments', icon: ClipboardList, label: 'View Assignments', desc: 'Accept or reject new deliveries', color: 'from-amber-500 to-orange-500' },
    { to: '/distributor/active', icon: Truck, label: 'Active Delivery', desc: 'Manage pickup and delivery steps', color: 'from-blue-500 to-indigo-500' },
    { to: '/distributor/earnings', icon: DollarSign, label: 'Earnings', desc: 'View your earnings breakdown', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="animate-fade-in-up stagger-1"><StatCard title="Pending Assignments" value={stats.pending} icon={ClipboardList} color="amber" /></div>
        <div className="animate-fade-in-up stagger-2"><StatCard title="Active Deliveries" value={stats.active} icon={Truck} color="blue" /></div>
        <div className="animate-fade-in-up stagger-3"><StatCard title="Total Earnings" value={`₹${stats.earnings}`} icon={DollarSign} /></div>
      </div>

      {/* Mini earnings chart */}
      {chartData.length > 0 && (
        <div className="animate-fade-in-up card-hover rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Earnings</h3>
            <div className="flex items-center gap-1 text-xs font-medium text-primary-600">
              <Zap className="h-3.5 w-3.5" />
              Last {chartData.length} deliveries
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
              <Bar dataKey="fee" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className="animate-fade-in-up card-hover group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            style={{ animationDelay: `${(i + 3) * 50}ms` }}
          >
            <div className={`rounded-xl bg-gradient-to-br ${item.color} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
              <item.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900">{item.label}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{item.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-primary-500 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
