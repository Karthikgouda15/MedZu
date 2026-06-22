import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pill, Plus, X } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', manufacturer: '', category: '', price: '' });

  const fetch = async () => {
    try {
      const { data } = await api.get('/admin/medicines?limit=1000');
      setMedicines(data.data || []);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetch();
    });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/medicines', { ...form, price: Number(form.price) });
      toast.success('Medicine added successfully');
      setIsModalOpen(false);
      setForm({ name: '', manufacturer: '', category: '', price: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-bold text-slate-900">{r.name}</span> },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'category', label: 'Category', render: (r) => (
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
        {r.category}
      </span>
    )},
    { key: 'price', label: 'Price', render: (r) => <span className="font-bold text-emerald-600">₹{r.price}</span> },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
        r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
      }`}>
        {r.status === 'active' ? 'Active' : 'Inactive'}
      </span>
    )},
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Medicine Catalog" subtitle="Manage the central catalog of medicines">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Medicine
        </button>
      </PageHeader>

      <DataTable columns={columns} data={medicines} emptyIcon={Pill} emptyMessage="No medicines in the catalog yet." />

      {/* Modern Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="animate-scale-in relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Medicine</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Medicine Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-premium"
                  placeholder="e.g., Paracetamol 500mg"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Manufacturer</label>
                <input
                  required
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  className="input-premium"
                  placeholder="e.g., GSK"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-premium"
                    placeholder="e.g., Analgesic"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-premium"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
