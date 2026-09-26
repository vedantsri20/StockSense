import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boxes, Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      success('Account created successfully! Welcome to StockSense.');
      navigate('/');
    } catch (err) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Create an Account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Join StockSense to manage operations and multi-warehouse inventory
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="sarah@company.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Password (min 6 characters)"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Select
              label="Operational Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder=""
              options={[
                { value: 'admin', label: 'Admin (Full Access)' },
                { value: 'manager', label: 'Inventory Manager' },
                { value: 'staff', label: 'Warehouse Staff' },
              ]}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Register & Continue
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
