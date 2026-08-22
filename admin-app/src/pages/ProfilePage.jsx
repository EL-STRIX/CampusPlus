import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ProfilePage() {
  const { user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const getPasswordStrength = () => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 10) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 4) return { label: 'Good', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-600', width: 'w-full' };
  };

  const strength = getPasswordStrength();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (!hasMinLength || !hasNumber) {
      setErrorMsg('New password must be at least 8 characters long and contain at least 1 number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    try {
      setUpdating(true);
      const res = await changePassword(currentPassword, newPassword);
      setSuccessMsg(res?.message || 'Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Admin Profile & Security
        </h2>
        <p className="text-xs sm:text-sm font-sans text-on-surface-variant mt-1">
          Manage your administrator account credentials and view account information.
        </p>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Overview Card */}
          <Card title="Account Overview" subtitle="Logged in administrator details">
            <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/20">
              <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-2xl shadow-sm">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-base text-on-surface capitalize truncate">
                  {user?.username || 'Administrator'}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-headline font-medium bg-primary/10 text-primary border border-primary/20 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Facilities In-Charge
                </span>
              </div>
            </div>

            <div className="pt-6 space-y-4 text-xs font-sans">
              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Username
                </span>
                <span className="font-mono text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
                  {user?.username || 'admin'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Department
                </span>
                <span className="text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
                  Central Facilities & Lab Maintenance
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  System Role
                </span>
                <span className="text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 block">
                  Full System Access (Reports & Maintenance)
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Account Status
                </span>
                <span className="text-on-surface bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active / Operational
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Change Password (7 cols) */}
        <div className="lg:col-span-7">
          <Card title="Change Password" subtitle="Enforce account security with regular password updates">
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-status-resolved/30 text-status-resolved text-xs font-medium flex items-center justify-between animate-fadeIn">
                <span>{successMsg}</span>
                <button onClick={() => setSuccessMsg(null)} className="text-status-resolved font-bold text-sm">
                  ×
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-xs font-medium flex items-center justify-between animate-fadeIn">
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-status-rejected font-bold text-sm">
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-14 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-on-surface-variant hover:text-on-surface"
                  >
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-headline font-bold text-on-surface">
                    New Password *
                  </label>
                  {newPassword && (
                    <span className="text-[11px] font-sans text-on-surface-variant">
                      Strength: <span className="font-semibold text-primary">{strength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min. 8 characters with at least 1 number"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-14 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-on-surface-variant hover:text-on-surface"
                  >
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Strength Meter */}
                {newPassword && (
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-2">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}></div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-14 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-on-surface-variant hover:text-on-surface"
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    <span>{hasMinLength ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    <span>{hasNumber ? '✓' : '○'}</span>
                    <span>At least 1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    <span>{passwordsMatch ? '✓' : '○'}</span>
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={updating}
                  disabled={updating || !hasMinLength || !hasNumber || !passwordsMatch}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
