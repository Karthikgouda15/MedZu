import { Link } from 'react-router-dom';
import { Pill, Truck, MapPin, Zap, ArrowRight, Shield, BarChart3, Package, Search, CheckCircle, Clock, Star } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';

const FEATURES = [
  { icon: MapPin, title: 'Geo Search', desc: 'Find nearby pharmacies with medicine in stock using MongoDB geospatial search.', color: 'from-emerald-500 to-teal-500' },
  { icon: Zap, title: 'Real-Time Updates', desc: 'Socket.IO powers instant notifications and live delivery tracking.', color: 'from-amber-500 to-orange-500' },
  { icon: Truck, title: 'Distributor Network', desc: 'Auto-assign nearest distributors and track GPS location every 5 seconds.', color: 'from-blue-500 to-indigo-500' },
  { icon: Package, title: 'Inventory Management', desc: 'Track your medicine stock in real-time with low-stock alerts.', color: 'from-purple-500 to-violet-500' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive analytics with revenue tracking and performance metrics.', color: 'from-rose-500 to-pink-500' },
  { icon: Shield, title: 'Audit Trail', desc: 'Complete audit logging for compliance and transparent operations.', color: 'from-cyan-500 to-blue-500' },
];

const STEPS = [
  { icon: Search, title: 'Search', desc: 'Find nearby pharmacies with the medicine you need' },
  { icon: Package, title: 'Request', desc: 'Send a procurement request to the supplier pharmacy' },
  { icon: Truck, title: 'Track', desc: 'Follow your delivery in real-time on the live map' },
  { icon: CheckCircle, title: 'Deliver', desc: 'Receive the medicine at your pharmacy doorstep' },
];

const STATS = [
  { value: 250, suffix: '+', label: 'Pharmacies Served' },
  { value: 12000, suffix: '+', label: 'Deliveries Completed' },
  { value: 15, suffix: '', label: 'Cities Covered' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
];

const TESTIMONIALS = [
  { name: 'Dr. Priya Sharma', role: 'Apollo Pharmacy, Bangalore', text: 'MedZu has transformed how we handle out-of-stock medicines. Our patients never leave empty-handed anymore.' },
  { name: 'Rajesh Kumar', role: 'Distributor, Hyderabad', text: 'The real-time GPS tracking makes my deliveries incredibly efficient. I can manage my routes and earnings easily.' },
  { name: 'Dr. Ankit Patel', role: 'MedPlus, Chennai', text: 'The analytics dashboard helps us understand demand patterns. We\'ve reduced stock-outs by 40% since joining.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-lg shadow-primary-200">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">Med<span className="text-primary-600">Zu</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary-50 to-transparent opacity-60 blur-3xl" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-[15%] animate-float opacity-20">
          <Pill className="h-16 w-16 text-primary-400" />
        </div>
        <div className="absolute bottom-20 left-[10%] animate-float opacity-15" style={{ animationDelay: '1s' }}>
          <Package className="h-12 w-12 text-teal-400" />
        </div>
        <div className="absolute top-40 left-[20%] animate-float opacity-10" style={{ animationDelay: '2s' }}>
          <Truck className="h-14 w-14 text-blue-400" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:py-36">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              Live Inter-Pharmacy Platform
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
              Real-Time Medicine
              <span className="block mt-2 gradient-text">Procurement Network</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
              When a medicine is unavailable, find nearby pharmacies with stock, request delivery,
              and track distributors in real time — like Swiggy, but for pharmacies.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-300/50 hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="animate-fade-in-up text-center" style={{ animationDelay: `${i * 100}ms` }}>
              <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500 + i * 200} />
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">Four simple steps to procure any medicine from nearby pharmacies</p>
          </div>
          <div className="relative mt-16 grid gap-8 md:grid-cols-4">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 md:block" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="animate-fade-in-up relative text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 text-white shadow-xl shadow-primary-200/50">
                  <step.icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600 shadow-md ring-2 ring-primary-100">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-slate-50/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Everything You Need</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">A complete platform for inter-pharmacy medicine procurement</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className="animate-fade-in-up card-hover group rounded-2xl border border-slate-200 bg-white p-7"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${feat.color} p-3.5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <feat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Trusted by Pharmacies</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">See what our users have to say about MedZu</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="animate-fade-in-up card-hover rounded-2xl border border-slate-200 bg-white p-7"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600 italic">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-teal-400 text-sm font-bold text-white">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="mx-6 mb-20 overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-600 shadow-2xl shadow-primary-200/40 lg:mx-auto lg:max-w-5xl">
        <div className="relative px-8 py-16 text-center sm:px-16">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">Ready to Get Started?</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-primary-100">
            Join hundreds of pharmacies already using MedZu to ensure their patients always get the medicines they need.
          </p>
          <Link
            to="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]"
          >
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-teal-500">
                  <Pill className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">MedZu</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Inter-pharmacy medicine procurement platform with real-time tracking.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link to="/register" className="hover:text-primary-600 transition-colors">For Pharmacies</Link></li>
                <li><Link to="/register" className="hover:text-primary-600 transition-colors">For Distributors</Link></li>
                <li><Link to="/login" className="hover:text-primary-600 transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Features</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>Geo-based Search</li>
                <li>Live GPS Tracking</li>
                <li>Inventory Management</li>
                <li>Analytics & Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Support</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} MedZu. Built for seamless inter-pharmacy medicine procurement.
          </div>
        </div>
      </footer>
    </div>
  );
}
