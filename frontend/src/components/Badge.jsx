import React from 'react';

const BADGE_STYLES = {
  // Stock Statuses
  in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200',
  
  // Document Statuses
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Ready: 'bg-blue-50 text-blue-700 border-blue-200',
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Canceled: 'bg-rose-50 text-rose-700 border-rose-200',

  // General Statuses
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',

  // Roles
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  manager: 'bg-blue-50 text-blue-700 border-blue-200',
  staff: 'bg-slate-100 text-slate-700 border-slate-200',

  // Operations
  RECEIPT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DELIVERY: 'bg-blue-50 text-blue-700 border-blue-200',
  TRANSFER: 'bg-purple-50 text-purple-700 border-purple-200',
  ADJUSTMENT: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const Badge = ({ status, label, className = '' }) => {
  const normalizedKey = status || 'Draft';
  const style = BADGE_STYLES[normalizedKey] || BADGE_STYLES[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  
  const displayLabel = label || status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {displayLabel}
    </span>
  );
};

export default Badge;
