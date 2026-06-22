export default function PageHeader({ title, subtitle, children, gradient = false }) {
  return (
    <div className={`animate-fade-in-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
      gradient 
        ? 'rounded-2xl bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-600 p-6 text-white' 
        : ''
    }`}>
      <div>
        <h2 className={`text-xl font-bold ${gradient ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        {subtitle && (
          <p className={`mt-1 text-sm ${gradient ? 'text-primary-100' : 'text-slate-500'}`}>{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
