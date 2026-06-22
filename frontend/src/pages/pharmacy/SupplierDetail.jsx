import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Store, MapPin, Package, Clock, ShieldAlert,
  ArrowLeft, ShoppingCart, Loader2,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DELIVERY_FEE = 50;

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    api.get(`/pharmacy/supplier/${id}/inventory`)
      .then(({ data }) => {
        setSupplier(data.data.pharmacy);
        setInventory(data.data.inventory.filter(item => item.quantity > 0));
      })
      .catch(() => toast.error('Failed to load supplier details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!supplier) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#2a3441] transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-[#2a3441]">Supplier Not Found</p>
          <p className="text-sm text-gray-400 mt-1">The supplier you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const categories = ['All', ...new Set(inventory.map(item => item.medicine?.category || 'General'))];

  const filteredInventory = selectedCategory === 'All'
    ? inventory
    : inventory.filter(item => (item.medicine?.category || 'General') === selectedCategory);

  const addToCart = (item) => {
    const existing = cart.find(c => c.medicine._id === item.medicine._id);
    if (existing) {
      if (existing.requestQty >= item.quantity) return toast.error('Cannot request more than available stock');
      setCart(cart.map(c => c.medicine._id === item.medicine._id ? { ...c, requestQty: c.requestQty + 1 } : c));
    } else {
      setCart([...cart, { ...item, requestQty: 1 }]);
    }
    toast.success(`Added ${item.medicine.name}`);
  };

  const removeFromCart = (medicineId) => setCart(cart.filter(c => c.medicine._id !== medicineId));

  const updateCartQty = (medicineId, qty) => {
    const item = inventory.find(i => i.medicine._id === medicineId);
    if (!item) return;
    if (qty <= 0) return removeFromCart(medicineId);
    if (qty > item.quantity) return toast.error('Cannot request more than available stock');
    setCart(cart.map(c => c.medicine._id === medicineId ? { ...c, requestQty: qty } : c));
  };

  const submitRequests = async () => {
    if (cart.length === 0) return toast.error('Add medicines to request');
    setSubmitting(true);
    let successCount = 0;

    for (const item of cart) {
      try {
        await api.post('/pharmacy/requests', {
          supplierPharmacyId: id,
          medicineId: item.medicine._id,
          quantity: item.requestQty,
        });
        successCount++;
      } catch {
        toast.error(`Failed to request ${item.medicine.name}`);
      }
    }

    setSubmitting(false);

    if (successCount > 0) {
      toast.success(`${successCount} request${successCount > 1 ? 's' : ''} submitted!`);
      setCart([]);
      setInventory(prev => {
        const updated = prev.map(i => {
          const cartItem = cart.find(c => c.medicine._id === i.medicine._id);
          return cartItem ? { ...i, quantity: i.quantity - cartItem.requestQty } : i;
        });
        return updated.filter(i => i.quantity > 0);
      });
      navigate('/pharmacy/outgoing');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.medicine.price * item.requestQty), 0);
  const addressStr = supplier.address?.city
    ? `${supplier.address.street ? supplier.address.street + ', ' : ''}${supplier.address.city}`
    : typeof supplier.address === 'string' ? supplier.address : 'Address not available';

  return (
    <div className="space-y-5 pb-24 max-w-6xl mx-auto relative">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-[#2a3441] transition-colors text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      {/* Supplier Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2a3441] via-[#37d38e]/70 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-black">{supplier.pharmacyName}</h1>
                {supplier.status === 'active' && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">OPEN</span>
                )}
              </div>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {addressStr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
            <div className="text-center">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">Delivery Fee</p>
              <p className="text-white font-black">₹{DELIVERY_FEE}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">ETA</p>
              <p className="text-white font-black flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~30 mins
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Inventory Section */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#2a3441]">Available Stock</h2>
            <span className="text-xs text-gray-400 font-medium">{filteredInventory.length} items</span>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedCategory === cat
                    ? 'bg-[#2a3441] text-white border-[#2a3441]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2a3441]/30'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-bold text-[#2a3441]">No medicines in this category</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredInventory.map(({ medicine, quantity }) => {
                const cartItem = cart.find(c => c.medicine._id === medicine._id);
                return (
                  <div
                    key={medicine._id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#37d38e]/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#2a3441] truncate">{medicine.name}</h3>
                          <p className="text-xs text-gray-400">{medicine.manufacturer}</p>
                        </div>
                        {medicine.requiresPrescription && (
                          <span className="ml-2 flex-shrink-0 px-2 py-0.5 rounded-md bg-red-50 text-red-500 text-[10px] font-black uppercase flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" /> Rx
                          </span>
                        )}
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <p className="text-xl font-black text-[#2a3441]">₹{medicine.price}</p>
                        <span className="text-[10px] font-bold text-[#37d38e] bg-[#e4f7f0] px-2 py-0.5 rounded-full">
                          {quantity} units
                        </span>
                      </div>
                    </div>

                    {cartItem ? (
                      <div className="flex items-center justify-between bg-[#e4f7f0] rounded-xl p-1 border border-[#37d38e]/20">
                        <button
                          onClick={() => updateCartQty(medicine._id, cartItem.requestQty - 1)}
                          className="w-9 h-9 rounded-lg bg-white text-[#37d38e] font-black hover:bg-[#37d38e] hover:text-white transition-colors shadow-sm"
                        >
                          −
                        </button>
                        <span className="font-black text-[#2a3441] w-8 text-center">{cartItem.requestQty}</span>
                        <button
                          onClick={() => updateCartQty(medicine._id, cartItem.requestQty + 1)}
                          className="w-9 h-9 rounded-lg bg-white text-[#37d38e] font-black hover:bg-[#37d38e] hover:text-white transition-colors shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart({ medicine, quantity })}
                        className="w-full py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-600 text-sm font-bold hover:border-[#37d38e] hover:text-[#37d38e] transition-colors"
                      >
                        ADD
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-base font-black text-[#2a3441] mb-5 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#37d38e]" />
              Procurement Request
              {cart.length > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-[#37d38e] text-white text-[10px] font-black flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold text-sm">Request list empty</p>
                <p className="text-xs text-gray-400 mt-1">Add medicines to procure stock</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                  {cart.map(item => (
                    <div key={item.medicine._id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2a3441] text-sm truncate">{item.medicine.name}</p>
                        <p className="text-xs text-gray-400">₹{item.medicine.price} × {item.requestQty}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-1.5 py-1 border border-gray-100 flex-shrink-0">
                        <button
                          onClick={() => updateCartQty(item.medicine._id, item.requestQty - 1)}
                          className="w-6 h-6 rounded bg-white text-gray-600 font-bold shadow-sm hover:bg-gray-100 transition-colors text-sm"
                        >−</button>
                        <span className="text-sm font-black text-[#2a3441] w-5 text-center">{item.requestQty}</span>
                        <button
                          onClick={() => updateCartQty(item.medicine._id, item.requestQty + 1)}
                          className="w-6 h-6 rounded bg-white text-gray-600 font-bold shadow-sm hover:bg-gray-100 transition-colors text-sm"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Items Total</span>
                    <span className="font-semibold text-[#2a3441]">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-[#2a3441]">₹{DELIVERY_FEE}</span>
                  </div>
                  <div className="flex justify-between font-black text-[#2a3441] pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{cartTotal + DELIVERY_FEE}</span>
                  </div>

                  <button
                    onClick={submitRequests}
                    disabled={submitting}
                    className="w-full mt-3 bg-[#37d38e] hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-sm shadow-[#37d38e]/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      : 'Confirm Procurement'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Cart Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
          <div className="bg-[#2a3441] text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{cart.length} item{cart.length > 1 ? 's' : ''} · ₹{cartTotal + DELIVERY_FEE}</p>
              <p className="text-xs text-white/50">incl. ₹{DELIVERY_FEE} delivery</p>
            </div>
            <button
              onClick={submitRequests}
              disabled={submitting}
              className="bg-[#37d38e] text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
