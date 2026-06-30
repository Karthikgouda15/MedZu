import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Building2, Truck, Eye, EyeOff, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
  { value: 'pharmacy', label: 'Pharmacy', icon: Building2, desc: 'Register your pharmacy to procure medicines' },
  { value: 'distributor', label: 'Distributor', icon: Truck, desc: 'Deliver medicines between pharmacies' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [role, setRole] = useState('pharmacy');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    pharmacyName: '', address: '', latitude: '12.9716', longitude: '77.5946',
    licenseNumber: '', vehicleType: 'bike', vehicleNo: '',
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

    // Validate coordinates before submitting
    if (role === 'pharmacy') {
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        toast.error('Invalid latitude. Must be between -90 and 90.');
        setLoading(false);
        return;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        toast.error('Invalid longitude. Must be between -180 and 180.');
        setLoading(false);
        return;
      }
    }

    try {
      await register({
        ...form, role,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      toast.success('Account created! You can now log in.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 px-4 py-8">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary-200 to-teal-200 opacity-30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 opacity-20 blur-3xl" />

      <div className="animate-fade-in-up relative w-full max-w-lg">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-xl shadow-primary-200">
              <Pill className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Create Account</h1>
            <p className="mt-1 text-sm text-slate-500">Join the MedZu platform</p>
          </div>

          {/* Role selector cards */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const isSelected = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`group relative flex flex-col items-center rounded-2xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle className="absolute -right-1.5 -top-1.5 h-5 w-5 text-primary-500 bg-white rounded-full" />
                  )}
                  <r.icon className={`h-6 w-6 mb-1.5 transition-colors ${isSelected ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>{r.label}</span>
                  <span className="mt-0.5 text-[10px] text-slate-400 text-center leading-tight">{r.desc}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Common fields */}
            {[
              ['name', 'Full Name', 'text', 'John Doe'],
              ['email', 'Email', 'email', 'you@example.com'],
              ['phone', 'Phone', 'text', '+91 9876543210'],
            ].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className="input-premium text-sm"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            {/* Password with strength */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="input-premium pr-10 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">{strength.label}</span>
                </div>
              )}
            </div>

            {/* Role-specific fields */}
            {role === 'pharmacy' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Pharmacy Name</label>
                  <input value={form.pharmacyName} onChange={(e) => update('pharmacyName', e.target.value)} className="input-premium text-sm" placeholder="Apollo Pharmacy" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Address</label>
                  <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input-premium text-sm" placeholder="123 MG Road, Bangalore" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">License Number</label>
                  <input value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} className="input-premium text-sm" placeholder="PH-2024-XXXX (optional)" />
                </div>
              </>
            )}

            {role === 'distributor' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Vehicle Type</label>
                  <select value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)} className="input-premium text-sm">
                    <option value="bike">🏍️ Bike</option>
                    <option value="scooter">🛵 Scooter</option>
                    <option value="car">🚗 Car</option>
                    <option value="van">🚐 Van</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Vehicle Number</label>
                  <input
                    value={form.vehicleNo}
                    onChange={(e) => update('vehicleNo', e.target.value)}
                    className="input-premium text-sm uppercase"
                    placeholder="KA01AB1234"
                    required
                  />
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Location Coordinates</label>
                  <p className="text-[10px] text-slate-400">Lat: −90 to 90 · Lng: −180 to 180</p>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 hover:text-primary-700"
                >
                  <MapPin className="h-3 w-3" /> Auto-detect
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.latitude}
                  onChange={(e) => update('latitude', e.target.value)}
                  className="input-premium text-sm"
                  placeholder="Latitude (e.g. 12.97)"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required
                />
                <input
                  value={form.longitude}
                  onChange={(e) => update('longitude', e.target.value)}
                  className="input-premium text-sm"
                  placeholder="Longitude (e.g. 77.59)"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Registering...
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
