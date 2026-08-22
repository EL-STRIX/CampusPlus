import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ProfilePage() {
  const { user, changePassword } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Simple preferences state (persisted in localStorage)
  const [emailAlerts, setEmailAlerts] = useState(() => {
    return localStorage.getItem('cp_pref_email_alerts') !== 'false';
  });
  const [dailyDigest, setDailyDigest] = useState(() => {
    return localStorage.getItem('cp_pref_daily_digest') === 'true';
  });
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('cp_pref_auto_refresh') !== 'false';
  });
  const [prefSaved, setPrefSaved] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setPasswordError('New password must be at least 8 characters long and contain at least 1 number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(res?.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Check your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('cp_pref_email_alerts', String(emailAlerts));
    localStorage.setItem('cp_pref_daily_digest', String(dailyDigest));
    localStorage.setItem('cp_pref_auto_refresh', String(autoRefresh));
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Admin Profile & Settings
        </h2>
        <p className="text-xs sm:text-sm font-sans text-on-surface-variant mt-1">
          Manage your account credentials, contact information, and notifications.
        </p>
      </div>

      {/* 1. Profile Details Card */}
      <Card title="Profile Information" subtitle="Your administrator account details">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-outline-variant/20">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-headline font-bold text-2xl flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-base text-on-surface capitalize">
                {user?.username || 'admin'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-headline font-semibold bg-primary/10 text-primary border border-primary/20">
                Staff Administrator
              </span>
            </div>
            <p className="text-xs font-sans text-on-surface-variant mt-0.5">
              Facilities Management & Maintenance Department
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 text-xs font-sans">
          <div>
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Username
            </label>
            <span className="font-mono text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
              {user?.username || 'admin'}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Primary Role
            </label>
            <span className="text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
              Facilities Maintenance In-Charge
            </span>
          </div>

          <div>
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Official Email
            </label>
            <span className="text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
              admin@campusplus.internal
            </span>
          </div>

          <div>
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
              Assigned Scope
            </label>
            <span className="text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
              All Academic Buildings & Labs
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Change Password Card */}
      <Card title="Change Password" subtitle="Update your login password regularly for account security">
        {passwordSuccess && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-status-resolved/30 text-status-resolved text-xs font-medium flex items-center justify-between">
            <span>{passwordSuccess}</span>
            <button onClick={() => setPasswordSuccess(null)} className="text-status-resolved font-bold text-sm">
              ×
            </button>
          </div>
        )}

        {passwordError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-xs font-medium flex items-center justify-between">
            <span>{passwordError}</span>
            <button onClick={() => setPasswordError(null)} className="text-status-rejected font-bold text-sm">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full pl-3.5 pr-12 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-sans text-on-surface-variant hover:text-on-surface px-1.5 py-0.5 rounded"
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
              New Password *
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-sans text-on-surface-variant hover:text-on-surface px-1.5 py-0.5 rounded"
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
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-3.5 pr-12 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-sans text-on-surface-variant hover:text-on-surface px-1.5 py-0.5 rounded"
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
              loading={updatingPassword}
              disabled={updatingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Notification Preferences Card */}
      <Card title="Preferences & Notifications" subtitle="Customize system alerts and interface behavior">
        {prefSaved && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-status-resolved/30 text-status-resolved text-xs font-medium">
            Preferences saved successfully.
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <span className="text-xs font-headline font-bold text-on-surface block">
                Urgent Fault Alerts
              </span>
              <span className="text-[11px] font-sans text-on-surface-variant">
                Notify when multiple students report the same equipment in under 1 hour.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <span className="text-xs font-headline font-bold text-on-surface block">
                Daily Maintenance Summary
              </span>
              <span className="text-[11px] font-sans text-on-surface-variant">
                Receive an overview of open and pending lab tickets every morning.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-surface-container-low transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
            />
            <div>
              <span className="text-xs font-headline font-bold text-on-surface block">
                Live Queue Auto-Refresh
              </span>
              <span className="text-[11px] font-sans text-on-surface-variant">
                Automatically refresh the reports feed every 60 seconds without reloading.
              </span>
            </div>
          </label>

          <div className="pt-2">
            <Button type="submit" variant="outline" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
