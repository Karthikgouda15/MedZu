import { useEffect, useState, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  PackagePlus, AlertTriangle, Search, Package,
  RefreshCw, X, ChevronUp, ChevronDown, Zap, WifiOff,
  Boxes, ShieldAlert, Tag,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';



function LiveBadge({ connected }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-[#e4f7f0] text-[#37d38e]' : 'bg-gray-100 text-gray-400'
      }`}>
      {connected
        ? <><span className="w-1.5 h-1.5 rounded-full bg-[#37d38e] animate-pulse" />Live</>
        : <><WifiOff className="w-3 h-3" />Offline</>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'green' }) {
  const colors = {
    green: 'bg-[#e4f7f0] text-[#37d38e]',
    red: 'bg-red-50 text-red-500',
    blue: 'bg-blue-50 text-blue-500',
    amber: 'bg-amber-50 text-amber-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-black text-[#2a3441]">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function PharmacyInventory() {
  const { connected, subscribe } = useSocket();
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [form, setForm] = useState({ medicineId: '', quantity: '', sellingPrice: '' });
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [justAddedId, setJustAddedId] = useState(null);
  const [liveFlash, setLiveFlash] = useState(null);
  const liveFlashTimer = useRef(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [inv, meds] = await Promise.all([
        api.get('/pharmacy/inventory'),
        api.get('/pharmacy/medicines/search?limit=100'),
      ]);
      setInventory(inv.data.data || []);
      setMedicines(meds.data.data || []);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const flashLive = (msg) => {
    clearTimeout(liveFlashTimer.current);
    setLiveFlash(msg);
    liveFlashTimer.current = setTimeout(() => setLiveFlash(null), 3000);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  useEffect(() => {
    const unsub = subscribe('inventory_updated', (data) => {
      setInventory(prev =>
        prev.map(item =>
          item._id === data._id ? { ...item, quantity: data.quantity ?? item.quantity } : item
        )
      );
      flashLive(data?.medicine?.name ? `${data.medicine.name} stock updated` : 'Inventory updated live');
      loadData(true);
    });
    return unsub;
  }, [subscribe]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/pharmacy/inventory', {
        medicineId: form.medicineId,
        quantity: Number(form.quantity),
        ...(form.sellingPrice ? { sellingPrice: Number(form.sellingPrice) } : {}),
      });
      toast.success('Stock added successfully');
      const addedId = form.medicineId;
      setForm({ medicineId: '', quantity: '', sellingPrice: '' });
      setCategoryFilter('All');
      setSearch('');
      await loadData(true);
      setJustAddedId(addedId);
      setTimeout(() => setJustAddedId(null), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (medicineId, quantity) => {
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) return;
    setUpdatingId(medicineId);
    try {
      await api.patch(`/pharmacy/inventory/${medicineId}`, { quantity: qty });
      setInventory(prev =>
        prev.map(item => item.medicine?._id === medicineId ? { ...item, quantity: qty } : item)
      );
      toast.success('Stock updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const categories = useMemo(() =>
    ['All', ...new Set(inventory.map(i => i.medicine?.category).filter(Boolean))],
    [inventory]
  );

  const filtered = useMemo(() => {
    let list = [...inventory];
    if (categoryFilter !== 'All')
      list = list.filter(i => i.medicine?.category === categoryFilter);
    if (search.trim())
      list = list.filter(i =>
        i.medicine?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.medicine?.manufacturer?.toLowerCase().includes(search.toLowerCase())
      );
    list.sort((a, b) => {
      let va, vb;
      if (sortKey === 'name') { va = a.medicine?.name || ''; vb = b.medicine?.name || ''; }
      else if (sortKey === 'quantity') { va = a.quantity; vb = b.quantity; }
      else if (sortKey === 'price') { va = a.medicine?.price || 0; vb = b.medicine?.price || 0; }
      else { va = a.medicine?.category || ''; vb = b.medicine?.category || ''; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [inventory, categoryFilter, search, sortKey, sortDir]);

  const lowStockCount = inventory.filter(i => i.quantity < 10 && i.quantity > 0).length;
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;
  const totalUnits = inventory.reduce((s, i) => s + (i.quantity || 0), 0);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#37d38e]" />
      : <ChevronDown className="w-3 h-3 text-[#37d38e]" />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 max-w-6xl mx-auto relative">
      {liveFlash && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#2a3441] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl">
          <Zap className="w-3.5 h-3.5 text-[#37d38e]" />
          {liveFlash}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#2a3441]">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your medicine stock in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge connected={connected} />
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Boxes} label="Total Items" value={inventory.length} sub={`${totalUnits.toLocaleString()} units total`} color="green" />
        <StatCard icon={ShieldAlert} label="Low Stock" value={lowStockCount} sub="Below 10 units" color="amber" />
        <StatCard icon={AlertTriangle} label="Out of Stock" value={outOfStockCount} sub="Zero units" color="red" />
        <StatCard icon={Tag} label="Categories" value={categories.length - 1} sub="Distinct categories" color="blue" />
      </div>

      {/* Add Stock Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#e4f7f0] flex items-center justify-center">
            <PackagePlus className="w-4 h-4 text-[#37d38e]" />
          </div>
          <span className="font-bold text-[#2a3441]">Add / Replenish Stock</span>
        </div>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <select
            value={form.medicineId}
            onChange={(e) => setForm({ ...form, medicineId: e.target.value })}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-[#2a3441] focus:outline-none focus:ring-2 focus:ring-[#37d38e]/30 focus:border-[#37d38e]"
            required
          >
            <option value="">Select Medicine</option>
            {medicines.map((m) => (
              <option key={m._id} value={m._id}>{m.name} — {m.manufacturer}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Qty"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full sm:w-28 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-[#2a3441] focus:outline-none focus:ring-2 focus:ring-[#37d38e]/30 focus:border-[#37d38e]"
            min="0"
            required
          />
          <input
            type="number"
            placeholder="Price ₹ (opt)"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            className="w-full sm:w-36 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-[#2a3441] focus:outline-none focus:ring-2 focus:ring-[#37d38e]/30 focus:border-[#37d38e]"
            min="0"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#37d38e] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm shadow-[#37d38e]/30 whitespace-nowrap"
          >
            {submitting
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <><PackagePlus className="w-4 h-4" /> Add Stock</>}
          </button>
        </form>
      </div>

      {/* Search + Category filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine or manufacturer..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#2a3441] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#37d38e]/30 focus:border-[#37d38e]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${categoryFilter === cat
                  ? 'bg-[#2a3441] text-white border-[#2a3441]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#2a3441]/30'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 font-medium -mt-1">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        {lowStockCount > 0 && <span className="ml-2 text-amber-500 font-bold">· {lowStockCount} low stock</span>}
        {outOfStockCount > 0 && <span className="ml-2 text-red-500 font-bold">· {outOfStockCount} out of stock</span>}
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-bold text-[#2a3441]">No items found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    { key: 'name', label: 'Medicine' },
                    { key: 'manufacturer', label: 'Manufacturer' },
                    { key: 'category', label: 'Category' },
                    { key: 'price', label: 'Price' },
                    { key: 'quantity', label: 'Stock Qty' },
                    { key: null, label: 'Status' },
                  ].map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.key && toggleSort(col.key)}
                      className={`px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide ${col.key ? 'cursor-pointer hover:text-[#2a3441] select-none' : ''
                        }`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.key && <SortIcon col={col.key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => {
                  const med = item.medicine;
                  const isLow = item.quantity > 0 && item.quantity < 10;
                  const isOut = item.quantity === 0;
                  const isUpdating = updatingId === med?._id;

                  return (
                    <tr
                      key={item._id || med?._id}
                      className={`transition-all duration-700 hover:bg-gray-50/70 ${med?._id === justAddedId
                          ? 'bg-[#e4f7f0] ring-1 ring-inset ring-[#37d38e]/40'
                          : isOut ? 'bg-red-50/30' : isLow ? 'bg-amber-50/30' : ''
                        }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2a3441] text-sm">{med?.name}</span>
                          {med?._id === justAddedId && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#37d38e] text-white text-[9px] font-black">
                              <Zap className="w-2.5 h-2.5" /> UPDATED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500">{med?.manufacturer}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-1 rounded-lg bg-gray-100 text-[11px] font-semibold text-gray-600">
                          {med?.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#37d38e]">₹{med?.price}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={item.quantity}
                            onBlur={(e) => {
                              if (Number(e.target.value) !== item.quantity) {
                                handleUpdate(med?._id, e.target.value);
                              }
                            }}
                            className={`w-24 rounded-lg border px-3 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-2 transition-colors ${isOut
                                ? 'border-red-300 bg-red-50 text-red-600 focus:ring-red-100'
                                : isLow
                                  ? 'border-amber-300 bg-amber-50 text-amber-700 focus:ring-amber-100'
                                  : 'border-gray-200 bg-gray-50 text-[#2a3441] focus:ring-[#37d38e]/20 focus:border-[#37d38e]'
                              }`}
                          />
                          {isUpdating && <RefreshCw className="w-3.5 h-3.5 text-[#37d38e] animate-spin" />}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-black border border-red-100">
                            <AlertTriangle className="w-3 h-3" /> OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100">
                            <AlertTriangle className="w-3 h-3" /> LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e4f7f0] text-[#37d38e] text-[10px] font-black border border-[#37d38e]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#37d38e]" /> IN STOCK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
