import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Pill, Truck, MapPin, Shield, 
  Package, Search, Crosshair, Activity 
} from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import heroPharma from '../assets/hero_pharma.png';

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

const STATS = [
  { value: 250, suffix: '+', label: 'Pharmacies Served' },
  { value: 12000, suffix: '+', label: 'Deliveries Completed' },
  { value: 15, suffix: '', label: 'Cities Covered' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
];

export default function LandingPage() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [location, setLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

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
        // Fallback to mock location
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
      
      {/* ─── Hero Split Section ─── */}
      <section className="flex flex-col lg:flex-row min-h-[85vh] bg-white border-b border-slate-100 relative overflow-hidden">
        
        {/* Left Side: Brand, Headline, Location Input & Cities */}
        <div className="w-full lg:w-[58%] px-6 md:px-12 lg:px-20 py-8 flex flex-col justify-between z-10">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-lg shadow-primary-200">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                Med<span className="text-primary-600">Zu</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Core Content Box */}
          <div className="flex-1 flex flex-col justify-center max-w-xl py-6 sm:py-12">
            {/* Animated Headline Carousel */}
            <div className="h-[120px] sm:h-[140px] flex flex-col justify-end">
              <h1 key={`headline-${headlineIndex}`} className="text-3xl sm:text-[2.6rem] font-black tracking-tight text-slate-900 leading-tight animate-fade-in-up">
                {HEADLINES[headlineIndex].text}
              </h1>
            </div>
            
            <p key={`sub-${headlineIndex}`} className="mt-4 text-base sm:text-lg text-slate-500 font-medium animate-fade-in-up">
              {HEADLINES[headlineIndex].sub}
            </p>

            {/* Address Search Bar */}
            <div className="relative mt-8 flex flex-col sm:flex-row gap-2 sm:gap-0 border-2 border-slate-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 rounded-xl sm:rounded-xl bg-white p-1.5 transition-all duration-200 shadow-sm">
              <div className="flex flex-1 items-center min-w-0">
                <Search className="h-5 w-5 text-slate-400 ml-2.5 flex-shrink-0" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter pharmacy delivery address..." 
                  className="w-full pl-3 pr-2 py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-0 outline-none focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Locate Me Trigger */}
              <button 
                onClick={handleLocateMe}
                disabled={locating}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-slate-500 hover:text-primary-600 transition-colors text-sm font-semibold rounded-lg hover:bg-slate-50 mr-1 disabled:opacity-50"
              >
                {locating ? (
                  <span className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Crosshair className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Locate Me</span>
              </button>

              {/* Find Button */}
              <button 
                onClick={handleFindMedicines}
                className="rounded-lg bg-primary-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700 transition-all active:scale-[0.98] uppercase tracking-wider"
              >
                Find Medicines
              </button>
            </div>

            {/* Popular Cities */}
            <div className="mt-8">
              <h4 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Popular Cities in India
              </h4>
              <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocation(`${city}, India`);
                      toast.success(`Selected ${city}`);
                    }}
                    className="font-bold text-slate-700 hover:text-primary-600 transition-all hover:scale-105"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="text-[11px] text-slate-400 mt-6 lg:mt-0 font-medium">
            MedZu network is operational across select cities in partnership with licensed pharmacies and local distributors.
          </div>
        </div>

        {/* Right Side: Visual Banner with Hero Image & floating UI indicators */}
        <div className="hidden lg:block lg:w-[42%] relative overflow-hidden bg-slate-900">
          <img 
            src={heroPharma} 
            alt="MedZu Pharmacy Procurement" 
            className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-[6000ms] ease-out"
          />
          {/* Subtle gradient shield overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950/20 via-transparent to-slate-950/60" />
          
          {/* Floating UI Widget 1 (Top Left) */}
          <div className="absolute top-12 left-10 glass rounded-2xl p-4 flex items-center gap-3 animate-float shadow-xl max-w-[210px] border border-white/40">
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-inner shadow-black/10">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Fast Delivery</p>
              <p className="text-sm font-black text-slate-800">⚡ In 24 Mins</p>
            </div>
          </div>

          {/* Floating UI Widget 2 (Bottom Right) */}
          <div className="absolute bottom-16 right-10 glass-dark rounded-2xl p-4 flex items-center gap-3 animate-float shadow-2xl border border-white/10" style={{ animationDelay: '1.5s' }}>
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Verified Stock</p>
              <p className="text-sm font-black text-white">100% Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section (Full Width Ribbon) ─── */}
      <section className="bg-white border-b border-slate-100 py-10 shadow-sm relative z-20">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
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

      {/* ─── Features Grid Section (Deep Charcoal Contrast Background) ─── */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 h-[350px] w-[350px] rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[350px] w-[350px] rounded-full bg-teal-600/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div 
                key={feat.title} 
                className="flex flex-col items-center text-center p-4 group"
              >
                {/* Custom icon container styled like Swiggy banner features */}
                <div className="mb-6 h-24 w-24 rounded-full bg-slate-800/80 border-2 border-slate-700/50 flex items-center justify-center text-primary-400 group-hover:scale-105 group-hover:border-primary-500 transition-all duration-300 shadow-lg shadow-black/30">
                  <feat.icon className="h-10 w-10 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {feat.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-sm">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile App Promotion Banner Section (HTML/CSS Smartphone Simulator) ─── */}
      <section className="bg-white py-24 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="bg-slate-950 rounded-[2.5rem] text-white p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl relative border border-slate-800">
            {/* Ambient gradients */}
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
            
            {/* Info details */}
            <div className="flex-1 max-w-xl relative z-10 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Medicines in your pocket.<br />
                <span className="gradient-text bg-gradient-to-r from-emerald-400 to-teal-400">Download the MedZu App</span>
              </h2>
              <p className="mt-4 text-base text-slate-400 leading-relaxed">
                Connect your pharmacy to nearby inventory hubs, place lightning-fast procurement requests, and monitor your delivery rider's live coordinates in real-time. Everything is just one click away.
              </p>

              {/* Real CSS-drawn download badge buttons */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                {/* App Store Badge */}
                <a href="#appstore" onClick={(e) => { e.preventDefault(); toast.success("Redirecting to Apple App Store..."); }} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-5 py-2.5 hover:bg-slate-800 transition-colors shadow-md">
                  {/* Apple Icon */}
                  <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.24 12.37,21.24C10.84,21.24 10.37,21.97 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Download on the</p>
                    <p className="text-sm font-bold text-white mt-0.5">App Store</p>
                  </div>
                </a>

                {/* Google Play Store Badge */}
                <a href="#playstore" onClick={(e) => { e.preventDefault(); toast.success("Redirecting to Google Play Store..."); }} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-5 py-2.5 hover:bg-slate-800 transition-colors shadow-md">
                  {/* Google Play Icon */}
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

            {/* Right side: HTML/CSS Smartphone Simulator */}
            <div className="relative mx-auto lg:mx-0 w-[240px] h-[480px] bg-slate-900 rounded-[2.8rem] border-8 border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-800/30 flex-shrink-0 relative z-10">
              {/* Speaker notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-600 rounded-full"></div>
              </div>
              
              {/* Simulator Screen */}
              <div className="absolute inset-0 bg-slate-50 flex flex-col pt-6 font-sans select-none text-slate-900">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-4 py-1 text-[9px] font-bold text-slate-500">
                  <span>09:41</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-1.5 bg-slate-600 rounded-sm block"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-600 block"></span>
                  </div>
                </div>
                
                {/* Small App Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
                      <Pill className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] font-black text-slate-900">MedZu Tracker</span>
                  </div>
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
                </div>
                
                {/* Simulation Screen Content */}
                <div className="flex-1 overflow-hidden p-2.5 flex flex-col gap-2 bg-slate-50">
                  
                  {/* Search bar mock */}
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-200/55 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-medium">Search: Insulin, Lipitor...</span>
                    <Search className="h-2.5 w-2.5 text-slate-400" />
                  </div>
                  
                  {/* Map mockup wrapper */}
                  <div className="flex-1 bg-blue-50 rounded-lg relative overflow-hidden border border-slate-200/50 min-h-[130px]">
                    {/* Simulated street grids */}
                    <div className="absolute inset-0 opacity-15">
                      <div className="absolute top-1/4 left-0 right-0 h-1 bg-slate-500"></div>
                      <div className="absolute top-2/3 left-0 right-0 h-1 bg-slate-500"></div>
                      <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-slate-500"></div>
                      <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-slate-500"></div>
                    </div>
                    
                    {/* Courier Pin */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="bg-emerald-600 text-white p-1 rounded-full shadow-md animate-bounce">
                        <Truck className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-[7px] bg-slate-900 text-white px-1 py-0.2 rounded-sm mt-0.5 whitespace-nowrap font-bold">Rider GPS</span>
                    </div>
                    
                    {/* Destination Pin */}
                    <div className="absolute bottom-1/4 left-1/4 flex flex-col items-center">
                      <div className="bg-primary-500 text-white p-1 rounded-full shadow-md">
                        <Pill className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-[7px] bg-slate-900 text-white px-1 py-0.2 rounded-sm mt-0.5 whitespace-nowrap font-bold">Your Pharmacy</span>
                    </div>
                  </div>
                  
                  {/* Bottom tracking status alert card */}
                  <div className="bg-slate-900 text-white p-2 rounded-lg shadow-md flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                      <Activity className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Status</p>
                      <p className="text-[9px] font-bold truncate mt-0.5 leading-tight">Procuring: Lipitor 10mg</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[9px] font-black text-emerald-400">ETA 4m</p>
                    </div>
                  </div>
                  
                </div>
              </div>
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-teal-500">
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
              &copy; {new Date().getFullYear()} MedZu Technologies Pvt. Ltd. Licensed under applicable drug rules.
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

