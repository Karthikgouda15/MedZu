import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Inbox, Send, MapPin, Search, ArrowRight, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PharmacyDashboard() {
  const { profile } = useAuth();
  const { subscribe } = useSocket();
  const [stats, setStats] = useState({ inventory: 0, incoming: 0, outgoing: 0, active: 0 });

  const load = async () => {
    try {
      const [inv, incoming, outgoing] = await Promise.all([
        api.get('/pharmacy/inventory'),
        api.get('/pharmacy/requests/incoming'),
        api.get('/pharmacy/requests/outgoing'),
      ]);
      const active = (outgoing.data.data || []).filter((r) =>
        !['completed', 'rejected'].includes(r.status)
      ).length;
      setStats({
        inventory: inv.data.data?.length || 0,
        incoming: incoming.data.data?.length || 0,
        outgoing: outgoing.data.data?.length || 0,
        active,
      });
    } catch (err) {
      console.error('Failed to load pharmacy dashboard stats:', err);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const events = ['new_request', 'request_accepted', 'request_rejected', 'delivery_completed'];
    const unsubs = events.map((e) => subscribe(e, load));
    return () => unsubs.forEach((u) => u());
  }, [subscribe]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = profile?.pharmacyName || 'Pharmacy';

  const quickActions = [
    { to: '/pharmacy/request', icon: Search, label: 'Request Medicine', desc: 'Find nearby pharmacies with stock', color: 'from-primary-500 to-teal-500' },
    { to: '/pharmacy/incoming', icon: Inbox, label: 'Incoming Requests', desc: 'Accept or reject requests', color: 'from-blue-500 to-indigo-500' },
    { to: '/pharmacy/tracking', icon: MapPin, label: 'Track Delivery', desc: 'Live map tracking', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-600 p-7 text-white shadow-xl shadow-primary-200/30">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary-100 text-sm font-medium">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h2 className="mt-2 text-2xl font-extrabold">{greeting}, {displayName}! 👋</h2>
          <p className="mt-1 text-primary-100">{profile?.address || 'MedZu Pharmacy Network'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up stagger-1"><StatCard title="Inventory Items" value={stats.inventory} icon={Package} /></div>
        <div className="animate-fade-in-up stagger-2"><StatCard title="Pending Incoming" value={stats.incoming} icon={Inbox} color="amber" /></div>
        <div className="animate-fade-in-up stagger-3"><StatCard title="Outgoing Requests" value={stats.outgoing} icon={Send} color="blue" /></div>
        <div className="animate-fade-in-up stagger-4"><StatCard title="Active Deliveries" value={stats.active} icon={MapPin} color="rose" /></div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className="animate-fade-in-up card-hover group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            style={{ animationDelay: `${(i + 4) * 50}ms` }}
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
