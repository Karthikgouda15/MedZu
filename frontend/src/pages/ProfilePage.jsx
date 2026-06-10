import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Building2, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function ProfilePage() {
  const { user, profile, loadUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name, phone });
      await loadUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile Settings" subtitle="Manage your account details and preferences" />

      <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-primary-400 to-teal-400 text-2xl font-bold text-white shadow-lg">
              {initials}
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm font-medium capitalize text-primary-600">{user?.role}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-premium pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  value={user?.email || ''} 
                  disabled 
                  className="input-premium pl-9 bg-slate-50 text-slate-500 cursor-not-allowed" 
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            {profile?.pharmacyName && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pharmacy Details</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    value={profile.pharmacyName} 
                    disabled 
                    className="input-premium pl-9 bg-slate-50 text-slate-500 cursor-not-allowed" 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Contact admin to update pharmacy details.</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </div>
                ) : (
                  <><Save className="h-4 w-4" /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
