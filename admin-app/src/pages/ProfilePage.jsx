import { useState } from 'react';
import { useAuth } from '../context/useAuth';
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

  // Real-time password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const getPasswordStrength = () => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (score <= 4) return { label: 'Good', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All password fields are required.');
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
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Admin Profile & Security
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-headline font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Active Session
            </span>
          </div>
          <p className="text-xs md:text-sm font-sans text-on-surface-variant mt-1">
            Manage your administrator account credentials, review security policies, and inspect system telemetry.
          </p>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Details & System Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Profile Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
            {/* Header Banner */}
            <div className="h-28 bg-gradient-to-r from-primary via-primary-container to-secondary p-6 flex justify-end items-start relative">
              <span className="px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-md text-white text-[11px] font-headline font-bold border border-white/20">
                Staff Identity
              </span>
            </div>

            {/* Profile Avatar & Bio */}
            <div className="px-6 pb-6 relative pt-0">
              <div className="-mt-12 mb-4 flex items-end justify-between">
                <div className="w-20 h-20 rounded-2xl bg-surface-container-lowest text-primary border-4 border-surface-container-lowest shadow-md flex items-center justify-center font-headline font-extrabold text-3xl bg-primary/10">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-headline font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  Super Admin
                </span>
              </div>

              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface capitalize">
                  {user?.username || 'Administrator'}
                </h3>
                <p className="text-xs font-sans text-on-surface-variant mt-0.5">
                  Facilities Maintenance & Lab Infrastructure In-Charge
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-outline-variant/20 space-y-3.5 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Administrator ID</span>
                  <span className="font-mono text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 text-[11px]">
                    {user?.id ? `${user.id.slice(0, 16)}...` : '3baf262d-8e71...'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Clearance Level</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Tier 4 (Full Access)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Session Token</span>
                  <span className="text-on-surface font-medium text-[11px]">
                    JWT (8h Rotation)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Authority Scope</span>
                  <span className="text-on-surface font-medium text-[11px]">
                    All Campus Facilities
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Telemetry & Cluster Status */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
            <span className="text-xs font-headline font-bold text-on-surface uppercase tracking-wider block">
              Infrastructure Telemetry
            </span>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-headline font-bold text-on-surface-variant block">
                  Database Cluster
                </span>
                <span className="font-semibold text-on-surface mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  PostgreSQL 18
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-headline font-bold text-on-surface-variant block">
                  ORM Engine
                </span>
                <span className="font-semibold text-on-surface mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Prisma Client
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-headline font-bold text-on-surface-variant block">
                  Security Guard
                </span>
                <span className="font-semibold text-on-surface mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Bcrypt Cost 12
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="text-[10px] uppercase font-headline font-bold text-on-surface-variant block">
                  API Gateway
                </span>
                <span className="font-semibold text-on-surface mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  REST v1 / Express
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Credential Management & Administrative Privileges (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Change Password Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card">
            <div className="pb-4 border-b border-outline-variant/20">
              <h3 className="text-lg font-headline font-bold text-on-surface">
                Update Account Password
              </h3>
              <p className="text-xs font-sans text-on-surface-variant mt-0.5">
                Protect your administrative privileges by maintaining a strong, unique password.
              </p>
            </div>

            {successMsg && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold text-sm">
                  ×
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg(null)} className="text-rose-700 font-bold text-sm">
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4.5 mt-5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold text-on-surface flex items-center justify-between">
                  <span>Current Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-medium"
                  >
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold text-on-surface flex items-center justify-between">
                  <span>New Password *</span>
                  {newPassword && (
                    <span className="text-[10px] font-semibold text-on-surface-variant">
                      Strength: <span className="font-bold text-primary">{strength.label}</span>
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min. 8 characters with at least 1 number"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-medium"
                  >
                    {showNew ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}></div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold text-on-surface">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-medium"
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Real-Time Requirements Checklist */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <span className="text-[11px] font-headline font-bold text-on-surface uppercase tracking-wider block">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    <span>{hasMinLength ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    <span>{hasNumber ? '✓' : '○'}</span>
                    <span>Contains a number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    <span>{hasLetter ? '✓' : '○'}</span>
                    <span>Contains letters</span>
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
                  Save New Password
                </Button>
              </div>
            </form>
          </div>

          {/* Administrative Privileges Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
            <span className="text-xs font-headline font-bold text-on-surface uppercase tracking-wider block">
              Governance & Administrative Privileges
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="font-headline font-bold text-on-surface block flex items-center gap-1.5">
                  <span className="text-primary font-bold">📋</span> Ticket Lifecycle Control
                </span>
                <p className="text-[11px] font-sans text-on-surface-variant">
                  Authority to transition reports through Open, In Progress, Resolved, and Rejected states.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="font-headline font-bold text-on-surface block flex items-center gap-1.5">
                  <span className="text-status-needs-review font-bold">🔍</span> Duplicate Consolidation
                </span>
                <p className="text-[11px] font-sans text-on-surface-variant">
                  Merge duplicate student submissions into single master incident tickets with reporter preservation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="font-headline font-bold text-on-surface block flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">🔬</span> Laboratory Asset Governance
                </span>
                <p className="text-[11px] font-sans text-on-surface-variant">
                  Manage equipment catalogs across all 22 collegiate laboratory domains and common utilities.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="font-headline font-bold text-on-surface block flex items-center gap-1.5">
                  <span className="text-amber-600 font-bold">🛡️</span> Audit Trail & History
                </span>
                <p className="text-[11px] font-sans text-on-surface-variant">
                  Timestamped transitions and action audit records logged automatically with administrator signature.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
