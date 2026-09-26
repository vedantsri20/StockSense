import React from 'react';

const COLOR_VARIANTS = {
  blue: {
    iconBg: 'bg-blue-50 text-blue-600',
    border: 'border-slate-200 hover:border-blue-300',
    indicator: 'bg-blue-600',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    border: 'border-slate-200 hover:border-emerald-300',
    indicator: 'bg-emerald-600',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    border: 'border-slate-200 hover:border-amber-300',
    indicator: 'bg-amber-500',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600',
    border: 'border-slate-200 hover:border-rose-300',
    indicator: 'bg-rose-600',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600',
    border: 'border-slate-200 hover:border-purple-300',
    indicator: 'bg-purple-600',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600',
    border: 'border-slate-200 hover:border-indigo-300',
    indicator: 'bg-indigo-600',
  },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick,
  className = '',
}) => {
  const scheme = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${scheme.border} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
