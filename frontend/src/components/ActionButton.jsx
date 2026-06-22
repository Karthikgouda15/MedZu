import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * A premium styled button that navigates to a route.
 * Props:
 * - to: destination path
 * - label: button text
 * - variant: optional styling variant ('primary' | 'secondary')
 */
export default function ActionButton({ to, label, variant = 'primary' }) {
  const baseClasses =
    'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none';
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
  };
  return (
    <Link to={to} className={`${baseClasses} ${variants[variant]}`}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
