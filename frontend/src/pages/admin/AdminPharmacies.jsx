import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Search, Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, active

  const fetch = async () => {
    try {
      const { data } = await api.get('/admin/pharmacies');
      setPharmacies(data.data || []);
    } catch (err) {
      console.error('Failed to fetch pharmacies:', err);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/pharmacies/${id}/status`, { status });
      toast.success(`Pharmacy marked as ${status}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = pharmacies.filter((p) => {
    const matchSearch = p.pharmacyName.toLowerCase().includes(search.toLowerCase()) || 
                        p.user?.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const columns = [
    { key: 'name', label: 'Pharmacy', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{r.pharmacyName}</p>
          <p className="text-xs text-slate-500">{r.user?.email}</p>
        </div>
      </div>
    )},
    { key: 'address', label: 'Address', render: (r) => (
      <span className="text-sm text-slate-600 line-clamp-1 max-w-[200px]" title={r.address}>{r.address}</span>
    )},
    { key: 'license', label: 'License No.', render: (r) => (
      <span className="font-mono text-xs text-slate-500">{r.licenseNumber || 'N/A'}</span>
    )},
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
        r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        r.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-rose-50 text-rose-700 border-rose-200'
      }`}>
        {r.status === 'active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
         r.status === 'pending' ? <ShieldAlert className="h-3.5 w-3.5" /> : 
         <X className="h-3.5 w-3.5" />}
        <span className="capitalize">{r.status}</span>
      </span>
    )},
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          {r.status !== 'active' && (
            <button
              onClick={() => updateStatus(r._id, 'active')}
              className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {r.status !== 'rejected' && r.status !== 'pending' && (
            <button
              onClick={() => updateStatus(r._id, 'rejected')}
              className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100"
              title="Reject/Deactivate"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacies" subtitle="Manage registered pharmacies and their approval status" />

      {/* Filters */}
      <div className="animate-fade-in-up flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pharmacies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium pl-9 text-sm py-2"
          />
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          {['all', 'pending', 'active'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyIcon={Building2} emptyMessage="No pharmacies found matching the criteria" />
    </div>
  );
}
