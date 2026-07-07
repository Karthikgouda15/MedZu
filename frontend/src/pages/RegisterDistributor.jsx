import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterDistributor() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    latitude: '12.9716', longitude: '77.5946',
    vehicleType: 'bike', vehicleNo: ''
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    toast.loading('Detecting location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('latitude', pos.coords.latitude.toFixed(6));
        update('longitude', pos.coords.longitude.toFixed(6));
        toast.success('Location detected!', { id: 'geo' });
      },
      () => toast.error('Location access denied', { id: 'geo' }),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...form,
        role: 'distributor',
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      toast.success('Rider Registration successful! Awaiting admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 py-8">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 opacity-20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-20 blur-3xl" />

      <div className="animate-fade-in-up relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-xl shadow-indigo-500/30">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Join as a Rider</h1>
            <p className="mt-1 text-sm text-slate-300">Deliver medicines, earn on your schedule</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields */}
            {[
              ['name', 'Full Name', 'text', 'John Doe'],
              ['email', 'Email', 'email', 'you@example.com'],
              ['phone', 'Phone Number', 'text', '+91 9876543210'],
            ].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-semibold text-slate-300">{label}</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-white/20'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Vehicle Type</label>
                <select 
                  value={form.vehicleType} 
                  onChange={(e) => update('vehicleType', e.target.value)} 
                  className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="bike">🏍️ Bike</option>
                  <option value="scooter">🛵 Scooter</option>
                  <option value="car">🚗 Car</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Vehicle Number</label>
                <input 
                  value={form.vehicleNo} 
                  onChange={(e) => update('vehicleNo', e.target.value)} 
                  className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors uppercase" 
                  placeholder="KA01AB1234" 
                  required 
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Current Location</label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <MapPin className="h-3 w-3" /> Auto-detect
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={form.latitude} onChange={(e) => update('latitude', e.target.value)} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none text-sm" placeholder="Latitude" />
                <input value={form.longitude} onChange={(e) => update('longitude', e.target.value)} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none text-sm" placeholder="Longitude" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3.5 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
                </>
              ) : 'Register as Rider'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already a rider?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
