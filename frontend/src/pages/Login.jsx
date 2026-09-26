import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boxes, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@stocksense.com');
    setPassword('Admin123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Sign in to StockSense
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise multi-warehouse inventory management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {/* Demo Credentials Quick Pill */}
          <div className="mb-6 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-blue-900">Demo Admin:</span> admin@stocksense.com
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs hover:shadow-xs transition-all"
            >
              Autofill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
