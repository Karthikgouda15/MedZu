import { Package } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Package, 
  title = 'No data found', 
  description = 'There are no items to display right now.', 
  action,
  actionLabel = 'Take Action'
}) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-8">
      <div className="mb-5 rounded-2xl bg-gradient-to-br from-primary-50 to-teal-50 p-5">
        <Icon className="h-10 w-10 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-slate-500">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
