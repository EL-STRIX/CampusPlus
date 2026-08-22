import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ProfilePage() {
  const { user, changePassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setErrorMsg('New password must be at least 8 characters long and contain at least 1 number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please check and try again.');
      return;
    }

    try {
      setUpdating(true);
      const res = await changePassword(currentPassword, newPassword);
      setSuccessMsg(res?.message || 'Your password has been updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect current password. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Admin Profile & Security
        </h2>
        <p className="text-sm font-sans text-on-surface-variant mt-1">
          Manage your administrator account credentials and view your access details.
        </p>
      </div>

      {/* Profile Details */}
      <Card title="Profile Details" subtitle="Your active staff account information">
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/20">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline font-bold text-xl flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface capitalize">
              {user?.username || 'Administrator'}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-on-surface-variant mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Facilities Maintenance In-Charge
            </span>
          </div>
        </div>

        <dl className="divide-y divide-outline-variant/20 text-xs font-sans">
          <div className="py-3.5 flex justify-between items-center">
            <dt className="font-medium text-on-surface-variant">Username</dt>
            <dd className="font-mono font-semibold text-on-surface">{user?.username || 'admin'}</dd>
          </div>

          <div className="py-3.5 flex justify-between items-center">
            <dt className="font-medium text-on-surface-variant">Department</dt>
            <dd className="font-medium text-on-surface">Central Facilities & Lab Maintenance</dd>
          </div>

          <div className="py-3.5 flex justify-between items-center">
            <dt className="font-medium text-on-surface-variant">Access Scope</dt>
            <dd className="font-medium text-on-surface">All Campus Labs & Equipment Reports</dd>
          </div>

          <div className="py-3.5 flex justify-between items-center">
            <dt className="font-medium text-on-surface-variant">Account Status</dt>
            <dd className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Active
            </dd>
          </div>
        </dl>
      </Card>

      {/* Change Password */}
      <Card title="Change Password" subtitle="Update your account password">
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
            <span>{successMsg}</span>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-700 font-bold hover:opacity-75"
            >
              ×
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-700 font-bold hover:opacity-75"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full pl-3.5 pr-12 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-on-surface-variant hover:text-on-surface"
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 8 characters with at least 1 number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-3.5 pr-12 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-on-surface-variant hover:text-on-surface"
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            <span className="text-[11px] font-sans text-on-surface-variant/80 mt-1 block">
              Must be at least 8 characters and include at least 1 number.
            </span>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-3.5 pr-12 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-on-surface-variant hover:text-on-surface"
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={updating}
              disabled={updating}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Session Management */}
      <Card title="Session & Logout" subtitle="Manage your current login session">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-headline font-bold text-on-surface block">
              Current Session
            </span>
            <span className="text-xs font-sans text-on-surface-variant mt-0.5 block">
              Logged in as <span className="font-semibold text-on-surface">{user?.username || 'admin'}</span> on this browser.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-error border-error/40 hover:bg-red-50 flex-shrink-0"
          >
            Log Out of Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
