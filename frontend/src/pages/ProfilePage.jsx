import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  User, Phone, Mail, Building2, Save, RefreshCw,
  Edit3, MapPin, Truck, Calendar, Hash, Star, Check,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const addrStr = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
};

const ROLE_CFG = {
  pharmacy: { gradient: 'from-[#37d38e] to-[#1aab6d]', pill: 'bg-[#e4f7f0] text-[#1aab6d]', accent: '#37d38e' },
  distributor: { gradient: 'from-blue-400 to-blue-600', pill: 'bg-blue-50 text-blue-600', accent: '#60a5fa' },
  admin: { gradient: 'from-violet-400 to-violet-600', pill: 'bg-violet-50 text-violet-600', accent: '#a78bfa' },
};

function InputField({ icon: Icon, label, value, onChange, disabled, hint, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl border transition-all focus:outline-none ${disabled
              ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-200 text-[#2a3441] focus:border-[#37d38e] focus:ring-2 focus:ring-[#37d38e]/20'
            }`}
        />
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <span className="text-xs font-bold text-[#2a3441] text-right capitalize max-w-[55%] truncate">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, loadUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const cfg = ROLE_CFG[user?.role] || ROLE_CFG.admin;
  const initials = (user?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })
    : '—';
  const dirty = name !== (user?.name || '') || phone !== (user?.phone || '');
  const addr = addrStr(profile?.address);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name, phone });
      await loadUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10">

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="h-36 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f1c28 0%, #1e2d3d 45%, #162b22 100%)' }}>
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.07 }}>
            <defs>
              <pattern id="hex" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
                <polygon points="20,2 38,12 38,34 20,44 2,34 2,12"
                  fill="none" stroke="#37d38e" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
            style={{ background: `radial-gradient(circle, ${cfg.accent}40, transparent 70%)` }} />
          <div className="absolute -bottom-16 -left-8 w-44 h-44 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(55,211,142,0.2), transparent 70%)' }} />
          <div className="absolute bottom-0 inset-x-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}80, transparent)` }} />
          <span className="absolute top-4 right-5 text-[11px] font-black tracking-[0.4em] uppercase select-none"
            style={{ color: `${cfg.accent}30` }}>MedZu</span>
          <div className="absolute top-4 left-5">
            <span className={`text-[10px] font-black capitalize px-3 py-1 rounded-full ${cfg.pill}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4 relative z-10">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-2xl font-black text-white border-[3px] border-white shadow-xl select-none`}>
              {initials}
            </div>
            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full mb-1 ${user?.status === 'active' ? 'bg-[#e4f7f0] text-[#37d38e]' : 'bg-gray-100 text-gray-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user?.status === 'active' ? 'bg-[#37d38e] animate-pulse' : 'bg-gray-400'}`} />
              {user?.status || 'active'}
            </span>
          </div>

          <h1 className="text-xl font-black text-[#2a3441] leading-tight">{user?.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              user?.phone && { icon: Phone, text: user.phone },
              profile?.pharmacyName && { icon: Building2, text: profile.pharmacyName },
              profile?.vehicleType && { icon: Truck, text: profile.vehicleType },
              addr && { icon: MapPin, text: addr },
              joinDate && { icon: Calendar, text: joinDate },
            ].filter(Boolean).map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                <Icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 font-medium max-w-[150px] truncate">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 rounded-full bg-[#37d38e]" />
          <p className="font-black text-[#2a3441] text-sm">Edit Profile</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField icon={User} label="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <InputField icon={Phone} label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          </div>

          <InputField icon={Mail} label="Email Address" value={user?.email || ''} disabled hint="Email cannot be changed." />

          {profile?.pharmacyName && (
            <InputField icon={Building2} label="Pharmacy Name" value={profile.pharmacyName} disabled hint="Contact admin to update pharmacy details." />
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#37d38e] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              {saving
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            {dirty && !saving && (
              <button
                type="button"
                onClick={() => { setName(user?.name || ''); setPhone(user?.phone || ''); }}
                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Discard
              </button>
            )}
            {!dirty && !saving && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Check className="w-3.5 h-3.5 text-[#37d38e]" /> Up to date
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Info</p>
        <InfoRow icon={User} label="User ID" value={user?._id?.slice(-12).toUpperCase()} />
        <InfoRow icon={Hash} label="Role" value={user?.role} />
        <InfoRow icon={Calendar} label="Member Since" value={joinDate} />
        {profile?.licenseNumber && <InfoRow icon={Hash} label="License No." value={profile.licenseNumber} />}
        {profile?.vehicleType && <InfoRow icon={Truck} label="Vehicle" value={profile.vehicleType} />}
        {profile?.availabilityStatus && <InfoRow icon={User} label="Availability" value={profile.availabilityStatus.replace(/_/g, ' ')} />}
        {profile?.totalEarnings != null && <InfoRow icon={Star} label="Total Earnings" value={`₹${Number(profile.totalEarnings).toLocaleString('en-IN')}`} />}
        {addr && <InfoRow icon={MapPin} label="Address" value={addr} />}
      </div>
    </div>
  );
}
