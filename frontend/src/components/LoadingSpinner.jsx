import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading inventory...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <Loader2 className="w-9 h-9 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
