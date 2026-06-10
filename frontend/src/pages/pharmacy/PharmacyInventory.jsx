import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PackagePlus, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';

export default function PharmacyInventory() {
  const { subscribe } = useSocket();
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [form, setForm] = useState({ medicineId: '', quantity: '' });

  const fetch = async () => {
    const [inv, meds] = await Promise.all([
      api.get('/pharmacy/inventory'),
      api.get('/pharmacy/medicines/search?limit=100'),
    ]);
    setInventory(inv.data.data);
    setMedicines(meds.data.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => subscribe('inventory_updated', fetch), [subscribe]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/inventory', {
        medicineId: form.medicineId,
        quantity: Number(form.quantity),
      });
      toast.success('Inventory updated');
      setForm({ medicineId: '', quantity: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleUpdate = async (medicineId, quantity) => {
    await api.patch(`/pharmacy/inventory/${medicineId}`, { quantity: Number(quantity) });
    toast.success('Stock updated');
    fetch();
  };

  const categories = ['All', ...new Set(inventory.map((i) => i.medicine?.category).filter(Boolean))];
  const filteredData = categoryFilter === 'All' 
    ? inventory 
    : inventory.filter(i => i.medicine?.category === categoryFilter);

  const columns = [
    { key: 'medicine', label: 'Medicine', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-900">{r.medicine?.name}</span>
        {r.quantity < 10 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600 border border-rose-200">
            <AlertTriangle className="h-3 w-3" /> Low Stock
          </span>
        )}
      </div>
    )},
    { key: 'manufacturer', label: 'Manufacturer', render: (r) => <span className="text-sm">{r.medicine?.manufacturer}</span> },
    { key: 'category', label: 'Category', render: (r) => (
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
        {r.medicine?.category}
      </span>
    )},
    { key: 'price', label: 'Price', render: (r) => <span className="font-medium text-emerald-600">₹{r.medicine?.price}</span> },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (r) => (
        <input
          type="number"
          defaultValue={r.quantity}
          onBlur={(e) => handleUpdate(r.medicine._id, e.target.value)}
          className={`w-24 rounded-lg border px-3 py-1.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
            r.quantity < 10 ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
          }`}
        />
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Management" subtitle="Track and update your pharmacy's medicine stock" />

      {/* Add Stock Form */}
      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 font-bold text-slate-900">
          <PackagePlus className="h-5 w-5 text-primary-500" /> Add Stock
        </div>
        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row">
          <select
            value={form.medicineId}
            onChange={(e) => setForm({ ...form, medicineId: e.target.value })}
            className="input-premium flex-1"
            required
          >
            <option value="">Select Medicine</option>
            {medicines.map((m) => (
              <option key={m._id} value={m._id}>{m.name} - {m.manufacturer}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="input-premium w-full sm:w-40"
            min="0"
            required
          />
          <button type="submit" className="btn-primary w-full sm:w-auto">Update Stock</button>
        </form>
      </div>

      {/* Categories Filter */}
      {inventory.length > 0 && (
        <div className="animate-fade-in-up flex flex-wrap gap-2 pt-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === cat 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <DataTable columns={columns} data={filteredData} emptyMessage="No inventory items match the current filter." />
    </div>
  );
}
