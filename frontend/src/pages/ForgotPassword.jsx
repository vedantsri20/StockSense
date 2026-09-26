import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boxes, Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      success('OTP generated successfully!');
      if (res.data?.otp) {
        setGeneratedOtp(res.data.otp);
      }
    } catch (err) {
      error(err.message || 'Failed to request password reset.');
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
            Forgot Password
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your account email to generate a one-time reset code
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {generatedOtp ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <KeyRound className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">OTP Code Generated</h4>
                <p className="text-2xl font-mono font-black tracking-widest text-emerald-700 bg-white py-2 rounded-lg border border-emerald-200">
                  {generatedOtp}
                </p>
                <p className="text-xs text-emerald-800">
                  Valid for 15 minutes. Use this code to reset your password.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() =>
                  navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${generatedOtp}`)
                }
                icon={ArrowRight}
              >
                Proceed to Reset Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                name="email"
                type="email"
                placeholder="admin@stocksense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
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
                Send Reset Code
              </Button>
            </form>
          )}

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

export default ForgotPassword;
