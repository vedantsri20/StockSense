import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Boxes, Mail, KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    if (emailParam) setEmail(emailParam);
    if (otpParam) setOtp(otpParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });
      success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      error(err.message || 'Failed to reset password. Please check your OTP.');
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
            Set New Password
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter the 6-digit OTP code and choose your new password
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              label="6-Digit OTP Code"
              name="otp"
              type="text"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              icon={KeyRound}
              required
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
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
              Update Password
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
