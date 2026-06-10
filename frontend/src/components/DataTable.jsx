import { useState } from 'react';
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react';

export default function DataTable({ columns, data, emptyMessage = 'No data found', emptyIcon: EmptyIcon = Inbox }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...(data || [])];
  if (sortKey) {
    sortedData.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  if (!data?.length) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-8">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
          <EmptyIcon className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => !col.render && handleSort(col.key)}
                  className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                    !col.render ? 'cursor-pointer select-none hover:text-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp className="h-3.5 w-3.5 text-primary-500" />
                        : <ChevronDown className="h-3.5 w-3.5 text-primary-500" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedData.map((row, i) => (
              <tr
                key={row._id || i}
                className="group transition-colors duration-150 hover:bg-primary-50/40"
                style={{ animation: `fadeInUp 0.3s ease-out ${i * 30}ms both` }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-slate-600 group-hover:text-slate-800">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-xs text-slate-400">
          Showing <span className="font-medium text-slate-600">{sortedData.length}</span> {sortedData.length === 1 ? 'result' : 'results'}
        </p>
      </div>
    </div>
  );
}
