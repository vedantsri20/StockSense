import React from 'react';

export const Table = ({ headers = [], children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {headers.map((h, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-4 py-3.5 whitespace-nowrap ${h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {typeof h === 'string' ? h : h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
