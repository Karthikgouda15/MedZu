import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, MapPin, Package, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import TrackingMap from '../../components/TrackingMap';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function PharmacyRequest() {
  const { profile } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [localStock, setLocalStock] = useState(null);

  useEffect(() => {
    api.get('/pharmacy/medicines/search?limit=100')
      .then(({ data }) => setMedicines(data.data || []))
      .catch((err) => console.error('Failed to fetch medicines:', err));
  }, []);

  const checkLocal = async () => {
    if (!selectedMedicine) return;
    try {
      const { data } = await api.get(`/pharmacy/stock/check?medicineId=${selectedMedicine}&quantity=${quantity}`);
      setLocalStock(data.data);
    } catch (err) {
      console.error('Failed to check local stock:', err);
      setLocalStock(null);
    }
  };

  useEffect(() => { checkLocal(); }, [selectedMedicine, quantity]);

  const searchNearby = async () => {
    if (!selectedMedicine) return toast.error('Select a medicine');
    setSearching(true);
    try {
      const { data } = await api.get(
        `/pharmacy/nearby-stock?medicineId=${selectedMedicine}&quantity=${quantity}`
      );
      setNearby(data.data);
      if (!data.data.length) toast('No nearby pharmacies with stock', { icon: 'ℹ️' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const createRequest = async (supplierPharmacyId) => {
    setLoading(true);
    try {
      await api.post('/pharmacy/requests', {
        supplierPharmacyId,
        medicineId: selectedMedicine,
        quantity: Number(quantity),
      });
      toast.success('Request created!');
      setNearby([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Request Medicine" subtitle="Find and procure out-of-stock medicines from nearby pharmacies" />

      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="input-premium pl-10"
            >
              <option value="">Search medicine...</option>
              {medicines.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-32">
            <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-premium pl-9"
              placeholder="Qty"
            />
          </div>
          <button
            onClick={searchNearby}
            disabled={searching}
            className="btn-primary"
          >
            {searching ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Searching...
              </div>
            ) : (
              <>Find Nearby <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>

        {localStock && (
          <div className={`mt-4 flex items-center gap-3 rounded-xl border p-4 ${localStock.available ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <div className={`rounded-full p-2 ${localStock.available ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{localStock.available ? 'Local Stock Available' : 'Insufficient Local Stock'}</p>
              <p className="text-sm">
                {localStock.available 
                  ? `You have ${localStock.quantity} units in local stock — you can fulfill this locally.`
                  : `You only have ${localStock.quantity} units in stock. Search nearby pharmacies to procure.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {nearby.length > 0 && (
        <div className="animate-fade-in-up stagger-1 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <TrackingMap
              requester={profile}
              supplier={nearby[0]?.pharmacy}
              height="350px"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((item, i) => (
              <div key={item.pharmacy._id} className="card-hover flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" style={{ animationDelay: `${(i+2)*50}ms` }}>
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-bold text-slate-900">{item.pharmacy.pharmacyName}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-bold text-primary-700">
                      {item.distance} km
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{item.pharmacy.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span>Stock: <span className="font-semibold text-slate-900">{item.availableStock}</span> units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>ETA: <span className="font-semibold text-slate-900">{item.estimatedDeliveryTime}</span></span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => createRequest(item.pharmacy._id)}
                  disabled={loading}
                  className="btn-primary mt-5 w-full"
                >
                  Request Procurement
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
