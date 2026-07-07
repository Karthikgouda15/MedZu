import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Inbox, Send, MapPin, Search, ArrowRight,
  Clock, TrendingUp, Zap, WifiOff,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';

function LiveBadge({ connected }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
      }`}>
      {connected
        ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />Live</>
        : <><WifiOff className="w-3 h-3" />Offline</>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'green', urgent }) {
  const colors = {
    green: { icon: 'bg-[#e4f7f0] text-[#37d38e]', val: 'text-[#2a3441]' },
    amber: { icon: 'bg-amber-50 text-amber-500', val: 'text-amber-600' },
    blue: { icon: 'bg-blue-50 text-blue-500', val: 'text-blue-600' },
    rose: { icon: 'bg-red-50 text-red-500', val: 'text-red-500' },
  };
  const c = colors[color] || colors.green;
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 transition-all hover:shadow-md ${urgent ? 'border-amber-200 ring-1 ring-amber-200' : 'border-gray-100'
      }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`text-2xl font-black ${c.val}`}>{value}</p>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function PharmacyDashboard() {
  const { profile } = useAuth();
  const { connected, subscribe } = useSocket();
  const [stats, setStats] = useState({ inventory: 0, incoming: 0, outgoing: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [liveFlash, setLiveFlash] = useState(null);

  const load = async () => {
    try {
      const [inv, incoming, outgoing] = await Promise.all([
        api.get('/pharmacy/inventory'),
        api.get('/pharmacy/requests/incoming?limit=1000'),
        api.get('/pharmacy/requests/outgoing?limit=1000'),
      ]);
      const active = (outgoing.data.data || []).filter(r =>
        !['completed', 'rejected'].includes(r.status)
      ).length;
      setStats({
        inventory: inv.data.data?.length || 0,
        incoming: (incoming.data.data || []).filter(r => r.status === 'pending').length,
        outgoing: outgoing.data.data?.length || 0,
        active,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      load();
    });
  }, []);

  useEffect(() => {
    const events = ['new_request', 'request_accepted', 'request_rejected', 'delivery_completed'];
    const unsubs = events.map(e => subscribe(e, (data) => {
      load();
      if (e === 'new_request') {
        setLiveFlash(`New request from ${data?.requesterPharmacy?.pharmacyName || 'a pharmacy'}`);
        setTimeout(() => setLiveFlash(null), 3500);
      }
    }));
    return () => unsubs.forEach(u => u());
  }, [subscribe]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = profile?.pharmacyName || 'Pharmacy';

  const quickActions = [
    {
      to: '/pharmacy/request', icon: Search,
      label: 'Search Medicine', desc: 'Find stock from nearby pharmacies & distributors',
      gradient: 'from-[#37d38e] to-teal-500', shadow: 'shadow-[#37d38e]/30',
    },
    {
      to: '/pharmacy/incoming', icon: Inbox,
      label: 'Incoming Requests', desc: 'Accept or reject procurement requests',
      gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-200',
      badge: stats.incoming > 0 ? stats.incoming : null,
    },
    {
      to: '/pharmacy/inventory', icon: Package,
      label: 'Manage Inventory', desc: 'Update stock levels and add medicines',
      gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-200',
    },
    {
      to: '/pharmacy/tracking', icon: MapPin,
      label: 'Live Tracking', desc: 'Real-time delivery map',
      gradient: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-200',
      badge: stats.active > 0 ? stats.active : null,
    },
    {
      to: '/pharmacy/outgoing', icon: Send,
      label: 'Outgoing Requests', desc: 'Track your procurement orders',
      gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-200',
    },
    {
      to: '/pharmacy/history', icon: TrendingUp,
      label: 'Order History', desc: 'Full record of procured & supplied medicines',
      gradient: 'from-slate-500 to-gray-600', shadow: 'shadow-slate-200',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {liveFlash && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#2a3441] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl">
          <Zap className="w-3.5 h-3.5 text-[#37d38e]" />
          {liveFlash}
        </div>
      )}

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2a3441] via-[#37d38e]/80 to-teal-500 p-7 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <LiveBadge connected={connected} />
          </div>
          <h2 className="mt-2 text-2xl font-black">{greeting}, {displayName}!</h2>
          <p className="mt-1 text-white/70 text-sm">
            {profile?.address?.city
              ? `${profile.address.city} · MedZu Pharma Network`
              : 'MedZu Pharma Network'}
          </p>
          {stats.incoming > 0 && (
            <Link
              to="/pharmacy/incoming"
              className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {stats.incoming} pending request{stats.incoming > 1 ? 's' : ''} waiting
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Inventory Items" value={stats.inventory} sub="medicines stocked" color="green" />
        <StatCard icon={Inbox} label="Pending Incoming" value={stats.incoming} sub="awaiting your action" color="amber" urgent={stats.incoming > 0} />
        <StatCard icon={Send} label="Outgoing Requests" value={stats.outgoing} sub="total sent" color="blue" />
        <StatCard icon={MapPin} label="Active Deliveries" value={stats.active} sub="en route now" color="rose" />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:border-[#37d38e]/30 hover:shadow-md transition-all duration-300"
            >
              <div className={`relative rounded-xl bg-gradient-to-br ${item.gradient} p-3 shadow-lg ${item.shadow} transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
                <item.icon className="h-5 w-5 text-white" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#2a3441] text-sm">{item.label}</h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0 transition-all group-hover:text-[#37d38e] group-hover:translate-x-1 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
