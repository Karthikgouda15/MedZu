import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Truck, Zap } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';
import AnimatedCounter from '../../components/AnimatedCounter';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-medium text-slate-500">{label || 'Delivery'}</p>
        <p className="mt-1 text-sm font-bold text-emerald-600">
          ₹{payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function DistributorEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/distributor/earnings')
      .then(({ data: res }) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch distributor earnings:', err);
        setData(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  const recentDeliveries = data?.recent || [];
  const chartData = recentDeliveries.slice(0, 10).map((r, i) => ({
    name: `Delivery ${i + 1}`,
    date: new Date(r.updatedAt).toLocaleDateString(),
    fee: r.deliveryFee || 0,
  })).reverse();

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings Dashboard" subtitle="Track your delivery revenue and performance" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="absolute -right-4 -top-4 rounded-full bg-emerald-100 p-6 opacity-50">
            <DollarSign className="h-12 w-12 text-emerald-500" />
          </div>
          <p className="relative z-10 text-sm font-bold uppercase tracking-wider text-emerald-800">Total Earnings</p>
          <p className="relative z-10 mt-2 text-4xl font-black text-emerald-600">
            <AnimatedCounter value={data?.totalEarnings || 0} prefix="₹" />
          </p>
        </div>

        <div className="animate-fade-in-up stagger-1 relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="absolute -right-4 -top-4 rounded-full bg-blue-100 p-6 opacity-50">
            <Truck className="h-12 w-12 text-blue-500" />
          </div>
          <p className="relative z-10 text-sm font-bold uppercase tracking-wider text-blue-800">Completed Deliveries</p>
          <p className="relative z-10 mt-2 text-4xl font-black text-blue-600">
            <AnimatedCounter value={data?.completedDeliveries || 0} />
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="animate-fade-in-up stagger-2 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Earnings Trend</h3>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Zap className="h-3 w-3 text-amber-500" /> Last 10 deliveries
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="fee" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFee)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-slate-400">
              No data available for chart
            </div>
          )}
        </div>

        {/* Recent List */}
        <div className="animate-fade-in-up stagger-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
          <h3 className="mb-4 font-bold text-slate-900">Recent Deliveries</h3>
          {recentDeliveries.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {recentDeliveries.map((r, i) => (
                <div key={r._id || i} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100 hover:border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110 group-hover:bg-emerald-200">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{r.medicine?.name || 'Medicine'}</p>
                      <p className="text-xs text-slate-500">{new Date(r.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">+₹{r.deliveryFee || 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-10">No completed deliveries yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
