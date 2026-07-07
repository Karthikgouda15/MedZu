import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Truck, DollarSign, ArrowRight, Zap, MapPin } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import StatCard from '../../components/StatCard';


export default function DistributorDashboard() {
  const { subscribe } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, active: 0, earnings: 0, recent: [] });
  const [pendingList, setPendingList] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  const load = async () => {
    try {
      const [assignments, active, earnings, me] = await Promise.all([
        api.get('/distributor/assignments'),
        api.get('/distributor/active'),
        api.get('/distributor/earnings'),
        api.get('/auth/me'),
      ]);
      setPendingList(assignments.data.data || []);
      setStats({
        pending: assignments.data.data.length,
        active: active.data.data.length,
        earnings: earnings.data.data.totalEarnings,
        recent: earnings.data.data.recent || [],
      });
      const currentStatus = me.data.data.profile?.availabilityStatus;
      setIsOnline(currentStatus === 'available' || currentStatus === 'busy');
    } catch (err) {
      console.error('Failed to load distributor dashboard stats:', err);
    }
  };

  const respond = async (id, accept) => {
    try {
      await api.patch(`/distributor/requests/${id}/respond`, { accept });
      toast.success(accept ? 'Assignment accepted! Opening tracking map...' : 'Assignment rejected');
      if (accept) {
        navigate('/distributor/active');
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    }
  };

  const handleToggleOnline = async () => {
    const newStatus = isOnline ? 'offline' : 'available';
    try {
      await api.patch('/distributor/availability', { status: newStatus });
      setIsOnline(!isOnline);
      toast.success(newStatus === 'available' ? 'You are now online' : 'You are now offline');
    } catch {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      load();
    });
  }, []);
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
      {/* Online/Offline Toggle Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleToggleOnline}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{isOnline ? 'You are Online' : 'You are Offline'}</h2>
            <p className="text-xs text-slate-500">{isOnline ? 'Waiting for incoming deliveries' : 'Go online to receive delivery requests'}</p>
          </div>
        </div>
      </div>

      {/* Swiggy-like Searching Animation */}
      {isOnline && stats.pending === 0 && stats.active === 0 && (
        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[250px] shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute w-32 h-32 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-48 h-48 bg-emerald-500/10 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
            <div className="absolute w-64 h-64 bg-emerald-500/5 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="relative z-10 text-white font-bold text-xl mb-1">Searching for requests...</h3>
          <p className="relative z-10 text-emerald-200/80 text-sm">Stay on this screen. We are finding nearby pharmacies.</p>
        </div>
      )}

      {/* Real-time Incoming Order Alert card */}
      {isOnline && pendingList.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-slate-900 p-6 text-white shadow-2xl animate-pulse-slow">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase animate-bounce">
                🚨 New Delivery Request
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {pendingList[0].medicine?.name}
              </h3>
              <p className="text-emerald-200 text-sm font-semibold">
                Quantity: {pendingList[0].quantity} • Est. Earnings: <span className="text-white text-base font-bold">₹{pendingList[0].deliveryFee}</span>
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 mt-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Pickup From</p>
                  <p className="font-semibold text-white mt-0.5">{pendingList[0].supplierPharmacy?.pharmacyName}</p>
                  <p className="text-xs text-slate-300 truncate">{pendingList[0].supplierPharmacy?.address}</p>
                </div>
                <div className="border-t border-white/10 pt-3 sm:border-t-0 sm:border-l sm:border-white/10 sm:pt-0 sm:pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Deliver To</p>
                  <p className="font-semibold text-white mt-0.5">{pendingList[0].requesterPharmacy?.pharmacyName}</p>
                  <p className="text-xs text-slate-300 truncate">{pendingList[0].requesterPharmacy?.address}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 flex-shrink-0 w-full md:w-48">
              <button
                onClick={() => respond(pendingList[0]._id, true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-lg shadow-black/20"
              >
                Accept Order
              </button>
              <button
                onClick={() => respond(pendingList[0]._id, false)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

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
