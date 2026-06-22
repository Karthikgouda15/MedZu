import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  Building2, Truck, Pill, Package, TrendingUp, CheckCircle2,
  RefreshCw, DollarSign, Activity, Star, Zap,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);

function KpiCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-[#2a3441] mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#2a3441] text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-black">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data: res } = await api.get('/admin/analytics');
      setData(res.data);
      setLastUpdated(new Date());
    } catch {
      // keep stale
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(() => load(true), 15000);
    return () => clearInterval(iv);
  }, [load]);

  if (loading) return <LoadingSpinner />;

  const { totals, revenue, charts, inventory } = data || {};

  const combined = (() => {
    const map = {};
    (charts?.monthlyRequests || []).forEach(d => { map[d.label] = { label: d.label, requests: d.count, deliveries: 0 }; });
    (charts?.monthlyDeliveries || []).forEach(d => {
      if (!map[d.label]) map[d.label] = { label: d.label, requests: 0, deliveries: 0 };
      map[d.label].deliveries = d.count;
    });
    return Object.values(map).slice(-8);
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#2a3441]">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live system metrics · {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { timeStyle: 'short' })}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Building2} label="Active Pharmacies" value={fmt(totals?.pharmacies)} sub="Approved & online" color="text-[#37d38e]" bg="bg-[#e4f7f0]" />
        <KpiCard icon={Truck} label="Distributors" value={fmt(totals?.distributors)} sub="Registered fleet" color="text-blue-500" bg="bg-blue-50" />
        <KpiCard icon={Package} label="Total Requests" value={fmt(totals?.requests)} sub="All time" color="text-violet-500" bg="bg-violet-50" />
        <KpiCard icon={CheckCircle2} label="Completed" value={fmt(totals?.completedDeliveries)} sub={`${totals?.successRate ?? 0}% success rate`} color="text-[#37d38e]" bg="bg-[#e4f7f0]" />
      </div>

      {/* Revenue + activity row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`₹${fmt(revenue?.totalRevenue)}`} sub="Completed orders" color="text-amber-500" bg="bg-amber-50" />
        <KpiCard icon={TrendingUp} label="Delivery Fees" value={`₹${fmt(revenue?.deliveryFees)}`} sub="Distributor fees" color="text-[#37d38e]" bg="bg-[#e4f7f0]" />
        <KpiCard icon={Zap} label="Active Deliveries" value={fmt(totals?.activeDeliveries)} sub="In transit now" color="text-orange-500" bg="bg-orange-50" />
        <KpiCard icon={Activity} label="Inventory Items" value={fmt(inventory?.totalItems)} sub={`${fmt(inventory?.totalQuantity)} units`} color="text-blue-500" bg="bg-blue-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Monthly requests + deliveries */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-black text-[#2a3441] text-sm">Requests vs Deliveries</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Monthly trend (last 8 months)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#37d38e]" />Requests</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Completed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={combined} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#37d38e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#37d38e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="requests" name="Requests" stroke="#37d38e" strokeWidth={2} fill="url(#gReq)" dot={false} />
              <Area type="monotone" dataKey="deliveries" name="Completed" stroke="#60a5fa" strokeWidth={2} fill="url(#gDel)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top pharmacies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-5">
            <p className="font-black text-[#2a3441] text-sm">Top Pharmacies</p>
            <p className="text-[10px] text-gray-400 mt-0.5">By completed orders</p>
          </div>
          {charts?.pharmacyPerformance?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={charts.pharmacyPerformance.slice(0, 6)}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" name="Orders" radius={[0, 6, 6, 0]}>
                  {charts.pharmacyPerformance.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#37d38e' : i === 1 ? '#5ae0a0' : '#a7f3d0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-300">
              <p className="text-sm font-medium">No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top distributors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <p className="font-black text-[#2a3441] text-sm">Top Distributors</p>
            <p className="text-[10px] text-gray-400 mt-0.5">By deliveries completed</p>
          </div>
          {charts?.distributorPerformance?.length ? (
            <div className="space-y-2">
              {charts.distributorPerformance.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200'
                    }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-[#2a3441] truncate">{d.name}</p>
                      <p className="text-xs font-black text-[#37d38e] ml-2">{d.completed} orders</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#37d38e] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (d.completed / (charts.distributorPerformance[0]?.completed || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 flex-shrink-0">₹{fmt(d.earnings)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-300">
              <p className="text-sm font-medium">No data yet</p>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <p className="font-black text-[#2a3441] text-sm">Platform Summary</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Key metrics at a glance</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Success Rate', value: `${totals?.successRate ?? 0}%`, bar: totals?.successRate ?? 0, color: 'bg-[#37d38e]' },
              { label: 'Active Deliveries', value: fmt(totals?.activeDeliveries), bar: totals?.requests ? Math.round((totals.activeDeliveries / totals.requests) * 100) : 0, color: 'bg-orange-400' },
              { label: 'Completed Orders', value: fmt(totals?.completedDeliveries), bar: totals?.requests ? Math.round((totals.completedDeliveries / totals.requests) * 100) : 0, color: 'bg-blue-400' },
              { label: 'Total Medicines', value: fmt(totals?.medicines), bar: Math.min(100, Math.round(((totals?.medicines ?? 0) / 200) * 100)), color: 'bg-violet-400' },
              { label: 'Inventory Quantity', value: fmt(inventory?.totalQuantity), bar: Math.min(100, Math.round(((inventory?.totalQuantity ?? 0) / 50000) * 100)), color: 'bg-[#37d38e]' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <p className="text-xs text-gray-500 font-medium w-36 flex-shrink-0">{s.label}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.bar}%` }} />
                </div>
                <p className="text-xs font-black text-[#2a3441] w-12 text-right flex-shrink-0">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
