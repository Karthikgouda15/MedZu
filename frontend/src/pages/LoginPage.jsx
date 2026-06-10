import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@medzu.com', password: 'admin123', color: 'from-purple-500 to-violet-500' },
  { label: 'Pharmacy', email: 'pharmacy1@medzu.com', password: 'pharmacy123', color: 'from-primary-500 to-teal-500' },
  { label: 'Distributor', email: 'distributor1@medzu.com', password: 'dist123', color: 'from-blue-500 to-indigo-500' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(null);
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(getDashboardRoute(data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const copyToClipboard = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 px-4">
      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary-200 to-teal-200 opacity-30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 opacity-20 blur-3xl" />

      <div className="animate-fade-in-up relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-xl shadow-primary-200">
              <Pill className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your MedZu account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-10"
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
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Register
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Demo Access</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account, idx) => (
                <div key={account.label} className="flex items-center gap-2">
                  <button
                    onClick={() => fillDemo(account)}
                    className={`flex-1 rounded-xl bg-gradient-to-r ${account.color} px-3 py-2 text-left text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01]`}
                  >
                    {account.label}
                  </button>
                  <button
                    onClick={() => copyToClipboard(`${account.email} / ${account.password}`, idx)}
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors hover:text-slate-600"
                    title="Copy credentials"
                  >
                    {copied === idx ? <Check className="h-3.5 w-3.5 text-primary-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
