import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Package, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-medium text-slate-900">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days'); // 7days, 30days, year

  useEffect(() => {
    // In a real app, dateRange would be passed as a query param
    api.get('/admin/analytics')
      .then(({ data: res }) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin analytics:', err);
        setData(null);
        setLoading(false);
      });
  }, [dateRange]);

  if (loading) return <LoadingSpinner />;

  // Mocking more detailed chart data for demonstration based on the response format
  const revenueData = data?.charts?.monthlyRequests?.map(m => ({
    name: m.label,
    revenue: m.count * 150, // mock revenue calculation
    commissions: m.count * 15,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Platform Analytics" subtitle="Deep dive into revenue, requests, and platform growth" />
        <div className="flex items-center gap-2 rounded-xl bg-white p-1 border border-slate-200 shadow-sm mb-6">
          <Calendar className="ml-2 h-4 w-4 text-slate-400" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent py-1.5 pl-2 pr-6 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Revenue Growth</h3>
              <p className="text-sm text-slate-500">Platform commissions vs Delivery fees</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Bar dataKey="revenue" name="Total Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="commissions" name="Commissions" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Requests Chart */}
        <div className="animate-fade-in-up stagger-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Request Volume</h3>
              <p className="text-sm text-slate-500">Number of procurement requests over time</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.charts?.monthlyRequests || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Line type="monotone" dataKey="count" name="Total Requests" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="animate-fade-in-up stagger-2 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-xl">
          <Package className="mb-4 h-8 w-8 text-primary-400" />
          <p className="text-sm font-medium text-slate-400">Total Requests</p>
          <p className="mt-1 text-3xl font-bold">{data?.totals?.requests}</p>
        </div>
        <div className="animate-fade-in-up stagger-3 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 p-6 text-white shadow-xl shadow-primary-200">
          <CheckCircle2 className="mb-4 h-8 w-8 text-white/80" />
          <p className="text-sm font-medium text-primary-100">Success Rate</p>
          <p className="mt-1 text-3xl font-bold">{data?.totals?.successRate}%</p>
        </div>
        <div className="animate-fade-in-up stagger-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <DollarSign className="mb-4 h-8 w-8 text-amber-500" />
          <p className="text-sm font-medium text-slate-500">Average Order Value</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">₹1,250</p>
        </div>
      </div>
    </div>
  );
}
