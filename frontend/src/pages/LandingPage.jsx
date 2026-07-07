import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Pill, Truck, MapPin, Shield,
  Package, Search, Crosshair, Activity,
  CheckCircle, Star, ArrowRight, Clock,
  Users, Zap, Heart, ChevronDown, MessageSquare, Lock
} from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import api from '../services/api';

const HEADLINES = [
  { text: "Critical medicine out of stock?", sub: "Find nearby pharmacies with stock instantly." },
  { text: "Urgent patient prescription?", sub: "Procure and deliver it to your doorstep in minutes." },
  { text: "Short on essential medical supplies?", sub: "Connect with the largest distributor network." },
  { text: "Inter-pharmacy stock shortage?", sub: "Search, request, and track medicines in real-time." }
];

const POPULAR_CITIES = [
  'Bangalore', 'Hyderabad', 'Mumbai', 'Chennai',
  'Delhi', 'Pune', 'Kolkata', 'Ahmedabad'
];

const FEATURES = [
  {
    icon: Package,
    title: 'No Minimum Order Limit',
    desc: 'Procure a single strip of rare tablets or order in bulk for your entire pharmacy inventory. No restrictions.'
  },
  {
    icon: MapPin,
    title: 'Real-Time GPS Tracking',
    desc: 'Follow your medicine courier in real-time. Keep track of temperature-sensitive items with live status updates.'
  },
  {
    icon: Truck,
    title: 'Express Pharmacy Delivery',
    desc: 'When patients are waiting, minutes matter. Our automated dispatch system ensures critical medicines arrive fast.'
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Search Medicine',
    desc: 'Enter the medicine name or prescription details. Our system instantly searches across all nearby pharmacies in your area.'
  },
  {
    step: '02',
    icon: Users,
    title: 'Find Suppliers',
    desc: 'View real-time stock availability from multiple pharmacies. Compare prices and delivery times at a glance.'
  },
  {
    step: '03',
    icon: Package,
    title: 'Place Request',
    desc: 'Select your preferred supplier and place the request. The system automatically assigns a verified distributor.'
  },
  {
    step: '04',
    icon: Truck,
    title: 'Track Delivery',
    desc: 'Monitor your medicine courier in real-time with GPS tracking. Get instant updates at every stage of delivery.'
  },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Owner, HealthFirst Pharmacy',
    rating: 5,
    text: 'MedZu transformed how we manage stock shortages. What used to take hours of phone calls now takes minutes. The real-time tracking is a game-changer.',
    avatar: 'RK'
  },
  {
    name: 'Priya Sharma',
    role: 'Head Pharmacist, Fortis Medical',
    rating: 5,
    text: 'The inter-pharmacy network is incredible. We found rare medicines within 15 minutes that were unavailable anywhere else. Highly recommended!',
    avatar: 'PS'
  },
  {
    name: 'Vikram Reddy',
    role: 'Distributor Partner',
    rating: 5,
    text: 'As a delivery partner, MedZu gives me consistent work and transparent earnings. The app makes route optimization effortless.',
    avatar: 'VR'
  },
];

const TRUST_BADGES = [
  { icon: Shield, text: 'FDA Compliant', sub: 'Drug safety standards' },
  { icon: CheckCircle, text: 'Verified Pharmacies', sub: 'Licensed & certified' },
  { icon: Lock, text: 'Secure Payments', sub: 'Encrypted transactions' },
  { icon: Heart, text: '24/7 Support', sub: 'Always here to help' },
];

const FAQS = [
  {
    q: 'How quickly can I get medicines delivered?',
    a: 'Most deliveries are completed within 24-45 minutes depending on your location and traffic conditions. Critical medicines are prioritized for faster delivery.'
  },
  {
    q: 'Are all pharmacies on MedZu verified?',
    a: 'Yes, every pharmacy on our platform undergoes a strict verification process including license validation, physical inspection, and background checks.'
  },
  {
    q: 'What if the medicine is out of stock?',
    a: 'Our system shows real-time stock availability. If a pharmacy runs out after you place a request, we automatically suggest alternative suppliers nearby.'
  },
  {
    q: 'Is there a minimum order value?',
    a: 'No! You can order a single strip of medicine or bulk inventory. MedZu has no minimum order restrictions.'
  },
  {
    q: 'How do I become a delivery partner?',
    a: 'Sign up as a distributor through our registration process. After verification of your vehicle and documents, you can start accepting deliveries immediately.'
  },
];

export default function LandingPage() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [location, setLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [stats, setStats] = useState([
    { value: 10, suffix: '+', label: 'Pharmacies Served' },
    { value: 4, suffix: '+', label: 'Deliveries Completed' },
    { value: 1, suffix: '', label: 'Cities Covered' },
    { value: 99.9, suffix: '%', label: 'Uptime' },
  ]);
  const navigate = useNavigate();

  // Load dynamic stats from MongoDB Atlas
  useEffect(() => {
    api.get('/public/stats')
      .then(({ data: res }) => {
        if (res.success && res.data) {
          setStats([
            { value: res.data.pharmacies, suffix: '+', label: 'Pharmacies Served' },
            { value: res.data.deliveries, suffix: '+', label: 'Deliveries Completed' },
            { value: res.data.cities, suffix: '', label: 'Cities Covered' },
            { value: res.data.uptime, suffix: '%', label: 'Uptime' },
          ]);
        }
      })
      .catch((err) => {
        console.error('Failed to load landing page stats:', err);
      });
  }, []);

  // Rotate headlines every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`Indiranagar, Bangalore (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
        setLocating(false);
        toast.success("Location set to your current coordinates!");
      },
      (error) => {
        console.error(error);
        // Fallback to default location
        setLocation("HSR Layout, Bangalore (12.9141° N, 77.6413° E)");
        setLocating(false);
        toast.success("Location set to default center");
      }
    );
  };

  const handleFindMedicines = () => {
    if (!location.trim()) {
      toast.error("Please enter a location or click 'Locate Me'!");
      return;
    }
    toast.success("Searching nearby pharmacies...");
    navigate(`/login?location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ─── Hero Section - Modern Abstract Design ─── */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating Geometric Shapes */}
          <div className="absolute top-32 right-20 w-20 h-20 border-2 border-primary-500/30 rotate-45 animate-float" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-40 left-32 w-16 h-16 border-2 border-teal-500/30 rounded-full animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-primary-500/20 rotate-12 animate-float" style={{ animationDuration: '7s', animationDelay: '3s' }}></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-6 md:px-12 lg:px-20 py-8 min-h-screen flex flex-col">

          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-lg shadow-primary-500/30">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Med<span className="text-primary-400">Zu</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-primary-500/30 hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto text-center py-12 sm:py-20">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium mb-8 mx-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Medicine Procurement Network</span>
            </div>

            {/* Animated Headline */}
            <div className="mb-6">
              <h1 key={`headline-${headlineIndex}`} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight animate-fade-in-up">
                {HEADLINES[headlineIndex].text}
              </h1>
            </div>

            <p key={`sub-${headlineIndex}`} className="mt-4 text-lg sm:text-xl text-slate-300 font-medium animate-fade-in-up max-w-2xl mx-auto">
              {HEADLINES[headlineIndex].sub}
            </p>

            {/* Search Bar */}
            <div className="relative mt-12 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-1 items-center min-w-0 px-4">
                <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter pharmacy delivery address..."
                  className="w-full py-3 text-base text-white placeholder-slate-400 bg-transparent border-0 outline-none focus:ring-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {locating ? (
                    <span className="h-4 w-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Crosshair className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Locate Me</span>
                </button>

                <button
                  onClick={handleFindMedicines}
                  className="rounded-xl bg-gradient-to-r from-primary-500 to-teal-500 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all"
                >
                  Find Medicines
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all"
              >
                <span>Register Pharmacy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register/distributor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent border-2 border-white/30 text-white text-sm font-bold hover:border-primary-400 hover:bg-primary-500/10 transition-all"
              >
                <Truck className="h-4 w-4" />
                <span>Become Partner</span>
              </Link>
            </div>

            {/* Popular Cities */}
            <div className="mt-12">
              <p className="text-sm text-slate-400 mb-4">Popular Cities</p>
              <div className="flex flex-wrap justify-center gap-3">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocation(`${city}, India`);
                      toast.success(`Selected ${city}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="hidden lg:grid grid-cols-3 gap-6 max-w-4xl mx-auto pb-12">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">10+</div>
              <div className="text-sm text-slate-300">Pharmacies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">4+</div>
              <div className="text-sm text-slate-300">Deliveries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-white mb-1">24min</div>
              <div className="text-sm text-slate-300">Avg Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section (Full Width Ribbon) ─── */}
      <section className="bg-white border-b border-slate-100 py-10 shadow-sm relative z-20">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1400 + i * 200} />
              </p>
              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Section - Modern Card Design ─── */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-100/50 to-teal-100/50"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-bold mb-4">
              <Zap className="h-4 w-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Why Choose <span className="text-primary-600">MedZu</span>?
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
              Built for pharmacies, designed for speed. Experience the future of medicine procurement.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((feat, index) => (
              <div
                key={feat.title}
                className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-200/50 transition-all duration-500 hover:-translate-y-2 border border-slate-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative">
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary-300/50 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <feat.icon className="h-8 w-8" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center gap-2 text-primary-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section - Timeline Design ─── */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-24 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-4">
              <Clock className="h-4 w-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              How It <span className="text-primary-600">Works</span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
              Get medicines delivered in 4 simple steps. From search to doorstep, we've streamlined the entire process.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 via-teal-500 to-emerald-500 rounded-full"></div>

            <div className="space-y-12">
              {HOW_IT_WORKS.map((item, index) => (
                <div key={item.step} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Content Card */}
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-200/50 transition-all duration-500 border border-slate-100 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary-300/50 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-primary-600 mb-1">STEP {item.step}</div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                          <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 items-center justify-center text-white font-black text-lg shadow-xl shadow-primary-300/50 z-10">
                    {index + 1}
                  </div>

                  {/* Empty Space for Alternating Layout */}
                  <div className="hidden lg:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Badges Section - Modern Grid ─── */}
      <section className="bg-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-4">
              <Shield className="h-4 w-4" />
              <span>Trusted & Secure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Built on Trust & Security
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge, index) => (
              <div
                key={badge.text}
                className="group relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-teal-500/0 rounded-2xl group-hover:from-primary-500/5 group-hover:to-teal-500/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-primary-300/50 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <badge.icon className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{badge.text}</h4>
                  <p className="text-xs text-slate-500 mt-1">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section - Marquee Scrolling Animation ─── */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/50 to-teal-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-100/50 to-emerald-100/50 rounded-full blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-4">
              <Star className="h-4 w-4 fill-current" />
              <span>Customer Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Trusted by <span className="text-primary-600">Pharmacies</span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
              See what our partners say about their experience with MedZu.
            </p>
          </div>

          {/* Marquee Container */}
          <div className="relative overflow-hidden">
            {/* Left Gradient Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
            {/* Right Gradient Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

            {/* Scrolling Track */}
            <div className="flex gap-8 animate-scroll">
              {/* Duplicate testimonials for seamless loop */}
              {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
                <div
                  key={`${testimonial.name}-${index}`}
                  className="flex-shrink-0 w-80 md:w-96 group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-200/50 transition-all duration-500 border border-slate-100 hover:-translate-y-2"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-400 opacity-50">
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  {/* Rating stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-slate-700 leading-relaxed mb-8 text-lg">
                    "{testimonial.text}"
                  </p>

                  {/* Author info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-300/50 group-hover:scale-110 transition-transform">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ─── FAQ Section - Modern Accordion ─── */}
      <section className="bg-white py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="faq-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#faq-pattern)" />
          </svg>
        </div>

        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold mb-4">
              <MessageSquare className="h-4 w-4" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked <span className="text-primary-600">Questions</span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
              Everything you need to know about MedZu.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${expandedFaq === index ? 'shadow-xl shadow-primary-100/50 border-primary-300' : 'hover:border-primary-200 hover:shadow-lg'}`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedFaq === index ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
                      <span className="font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="font-bold text-slate-900 pr-4 group-hover:text-primary-600 transition-colors">{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${expandedFaq === index ? 'rotate-180 text-primary-600' : ''}`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 pt-0 pl-20">
                    <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile App Section - Abstract Design ─── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-32 right-32 w-16 h-16 border-2 border-primary-500/20 rotate-45 animate-float" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-32 left-32 w-12 h-12 border-2 border-teal-500/20 rounded-full animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
        </div>

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-bold mb-6">
                <Zap className="h-4 w-4" />
                <span>Mobile Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Medicines in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">Pocket</span>
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
                Connect your pharmacy to nearby inventory hubs, place lightning-fast procurement requests, and monitor delivery riders in real-time. Everything is just one tap away.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a href="#appstore" onClick={(e) => { e.preventDefault(); toast.success("Redirecting to Apple App Store..."); }} className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 transition-all">
                  <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.24 12.37,21.24C10.84,21.24 10.37,21.97 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Download on the</p>
                    <p className="text-sm font-bold text-white mt-0.5">App Store</p>
                  </div>
                </a>

                <a href="#playstore" onClick={(e) => { e.preventDefault(); toast.success("Redirecting to Google Play Store..."); }} className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 transition-all">
                  <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L19.85,12.33C20.37,12.59 20.37,13.41 19.85,13.67L17.87,14.67L14.74,13.1L17.87,11.33M3,3.5C3,3.07 3.47,2.83 3.84,3.03L20.84,11.53C21.43,11.83 21.43,12.67 20.84,12.97L3.84,21.47C3.47,21.67 3,21.43 3,21V3.5Z" />
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Get it on</p>
                    <p className="text-sm font-bold text-white mt-0.5">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Abstract Phone Mockup */}
            <div className="relative mx-auto lg:mx-0">
              {/* Phone Frame */}
              <div className="relative w-64 h-[500px] bg-gradient-to-br from-slate-700 to-slate-800 rounded-[3rem] border-4 border-slate-600 shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-2 bg-gradient-to-br from-primary-500/20 to-teal-500/20 rounded-[2.5rem] overflow-hidden">
                  {/* Abstract App UI */}
                  <div className="absolute inset-0 p-6 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Pill className="h-5 w-5 text-white" />
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                        LIVE
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4"></div>

                    {/* Map Area */}
                    <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 relative overflow-hidden mb-4">
                      {/* Abstract Map Lines */}
                      <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/20"></div>
                        <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/20"></div>
                        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/20"></div>
                        <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/20"></div>
                      </div>

                      {/* Location Pins */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                          <Truck className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-1/4 left-1/4">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                          <Pill className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="w-full h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-3 p-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-3/4 bg-white/30 rounded mb-1"></div>
                        <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-black">4m</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements Around Phone */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white shadow-xl animate-float" style={{ animationDuration: '4s' }}>
                <Activity className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white animate-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section - Modern Design ─── */}
      <section className="relative py-32 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-teal-600 to-emerald-600"></div>

        {/* Animated Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-modern-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-modern-pattern)" />
          </svg>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        </div>

        <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold mb-8">
            <Heart className="h-4 w-4 fill-current" />
            <span>Join the Network</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Ready to Transform<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">Your Pharmacy?</span>
          </h2>

          <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of pharmacies already using MedZu to streamline medicine procurement and deliver better patient care.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white text-primary-600 font-bold text-lg hover:bg-slate-50 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1"
            >
              <span>Join as Pharmacy</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register/distributor"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-transparent border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-all hover:border-white/50"
            >
              <Truck className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Become a Partner</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 fill-current" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 fill-current" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 fill-current" />
              <span>Start in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer Section ─── */}
      <footer className="border-t border-slate-200 bg-[#0f172a] text-slate-400 pt-16 pb-12 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-4 pb-12 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-500">
                  <Pill className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white">MedZu</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Inter-pharmacy live medicine procurement network. Find nearby pharmacy stock, manage delivery, and prevent medicine shortages instantly.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">We Deliver To</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#cities" className="hover:text-white transition-colors">Bangalore (Bengaluru)</a></li>
                <li><a href="#cities" className="hover:text-white transition-colors">Mumbai</a></li>
                <li><a href="#cities" className="hover:text-white transition-colors">Hyderabad</a></li>
                <li><a href="#cities" className="hover:text-white transition-colors">Chennai</a></li>
                <li><a href="#cities" className="hover:text-white transition-colors">Delhi / NCR</a></li>
                <li><a href="#cities" className="hover:text-white transition-colors">Pune</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors font-semibold">Join Pharmacy Network</Link></li>
                <li><Link to="/register/distributor" className="hover:text-white transition-colors font-semibold">Become a Delivery Partner</Link></li>
                <li><a href="#about" className="hover:text-white transition-colors">About MedZu</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers & Team</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">Legal & Safety</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Procurement</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Shield Policy</a></li>
                <li><a href="#compliance" className="hover:text-white transition-colors">FDA / Drug Compliance</a></li>
                <li><a href="#safety" className="hover:text-white transition-colors">Cold Chain Standards</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              &​copy; {new Date().getFullYear()} MedZu Technologies Pvt. Ltd. Licensed under applicable drug rules.
            </div>
            <div className="flex gap-4">
              <a href="#social" className="hover:text-white">Facebook</a>
              <a href="#social" className="hover:text-white">Twitter</a>
              <a href="#social" className="hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}