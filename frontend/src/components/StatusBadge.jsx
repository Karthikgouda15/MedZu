import { CheckCircle, Clock, Truck, XCircle, Package, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

const STATUS_CONFIG = {
  pending:              { bg: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Clock,       pulse: false },
  accepted:             { bg: 'bg-blue-50 text-blue-700 border-blue-200',         icon: CheckCircle, pulse: false },
  rejected:             { bg: 'bg-rose-50 text-rose-700 border-rose-200',         icon: XCircle,     pulse: false },
  distributor_assigned: { bg: 'bg-purple-50 text-purple-700 border-purple-200',   icon: Truck,       pulse: true },
  pickup_started:       { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',   icon: ArrowRight,  pulse: true },
  picked_up:            { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',         icon: Package,     pulse: true },
  en_route:             { bg: 'bg-orange-50 text-orange-700 border-orange-200',   icon: Truck,       pulse: true },
  delivered:            { bg: 'bg-teal-50 text-teal-700 border-teal-200',         icon: MapPin,      pulse: false },
  completed:            { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',icon: ShieldCheck, pulse: false },
  active:               { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',icon: CheckCircle, pulse: true },
  inactive:             { bg: 'bg-slate-50 text-slate-600 border-slate-200',      icon: Clock,       pulse: false },
  available:            { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',icon: CheckCircle, pulse: true },
  offline:              { bg: 'bg-slate-50 text-slate-600 border-slate-200',      icon: Clock,       pulse: false },
};

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ') || 'unknown';
  const config = STATUS_CONFIG[status] || { bg: 'bg-slate-50 text-slate-600 border-slate-200', icon: Clock, pulse: false };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${config.bg}`}>
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
