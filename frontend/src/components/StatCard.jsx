import AnimatedCounter from './AnimatedCounter';
import { TrendingUp, TrendingDown } from 'lucide-react';

const GRADIENTS = {
  primary: 'from-primary-500 to-teal-500',
  blue: 'from-blue-500 to-indigo-500',
  amber: 'from-amber-400 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  purple: 'from-purple-500 to-violet-500',
};

const BG_COLORS = {
  primary: 'bg-primary-50 border-primary-100',
  blue: 'bg-blue-50 border-blue-100',
  amber: 'bg-amber-50 border-amber-100',
  rose: 'bg-rose-50 border-rose-100',
  purple: 'bg-purple-50 border-purple-100',
};

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend, trendValue, prefix = '', suffix = '' }) {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
  const isString = typeof value === 'string' && isNaN(value);

  return (
    <div className="card-hover group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {isString ? value : <AnimatedCounter value={numValue} prefix={prefix} suffix={suffix} />}
          </p>
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl bg-gradient-to-br ${GRADIENTS[color]} p-3 shadow-lg shadow-${color === 'primary' ? 'primary' : color}-200/50 transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      {/* Bottom gradient accent line */}
      <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${GRADIENTS[color]} opacity-20 transition-opacity group-hover:opacity-40`} />
    </div>
  );
}
