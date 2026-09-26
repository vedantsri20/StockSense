import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageX, Home } from 'lucide-react';
import Button from '../components/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <PackageX className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6">
        The inventory screen or route you are looking for does not exist or may have been relocated.
      </p>
      <Button
        variant="primary"
        onClick={() => navigate('/')}
        icon={Home}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
