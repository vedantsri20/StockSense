import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  LogOut,
  Calendar,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';

export const Profile = () => {
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // In demo mode, trigger reset with email
      const forgotRes = await authService.forgotPassword(user.email);
      if (forgotRes.success && forgotRes.data?.otp) {
        await authService.resetPassword({
          email: user.email,
          otp: forgotRes.data.otp,
          newPassword,
        });
        success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Account & Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View your session identity, operational permissions, and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-blue-500/20">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Administrator'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>

          <div className="pt-2">
            <Badge status={user?.role || 'admin'} label={`${user?.role || 'admin'} Access`} />
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-mono">{user?._id ? user._id.slice(-8) : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Environment:</span>
              <span className="font-semibold text-emerald-600">Production Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">API Port:</span>
              <span className="font-mono font-semibold">5001</span>
            </div>
          </div>

          <Button
            variant="danger"
            size="md"
            className="w-full mt-4"
            onClick={logout}
            icon={LogOut}
          >
            Sign Out
          </Button>
        </div>

        {/* Security & Password Settings */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account credentials</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Update Password
              </Button>
            </div>
          </form>

          {/* System Telemetry & Architecture Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              StockSense Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Frontend Port:</span> 5173 (Vite + React)
              </div>
              <div>
                <span className="text-slate-400">Backend Port:</span> 5001 (Node + Express)
              </div>
              <div>
                <span className="text-slate-400">Database Engine:</span> MongoDB Atlas
              </div>
              <div>
                <span className="text-slate-400">Auth Standard:</span> JWT + bcryptjs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
