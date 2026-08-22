import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ProfilePage() {
  const { user, changePassword, logout } = useAuth();

  // Contact Information State (persisted in localStorage for demo/production persistence)
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem('cp_admin_display_name') || 'Facilities Maintenance Administrator';
  });
  const [contactPhone, setContactPhone] = useState(() => {
    return localStorage.getItem('cp_admin_phone') || '+91 98300 12345';
  });
  const [officeLocation, setOfficeLocation] = useState(() => {
    return localStorage.getItem('cp_admin_office') || 'Central Admin Block, Ground Floor, Room 102';
  });
  const [contactEmail, setContactEmail] = useState(() => {
    return localStorage.getItem('cp_admin_contact_email') || 'facilities-desk@brainwareuniversity.ac.in';
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);

    localStorage.setItem('cp_admin_display_name', displayName);
    localStorage.setItem('cp_admin_phone', contactPhone);
    localStorage.setItem('cp_admin_office', officeLocation);
    localStorage.setItem('cp_admin_contact_email', contactEmail);

    setTimeout(() => {
      setSavingProfile(false);
      setProfileSuccess('Contact information updated successfully.');
      setTimeout(() => setProfileSuccess(null), 3500);
    }, 400);
  };

  const handlePasswordChange = async (e) => {
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
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(res?.message || 'Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Incorrect current password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight">
            Administrator Profile & Settings
          </h2>
          <p className="text-xs sm:text-sm font-sans text-on-surface-variant mt-1">
            Manage your staff contact info, university facility duties, and login credentials.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-headline font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Staff In-Charge
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): Staff Identity Card & Facility Scope */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-card">
            <div className="flex flex-col items-center text-center pb-6 border-b border-outline-variant/20">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-headline font-bold text-3xl shadow-inner mb-3">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {displayName}
              </h3>
              <span className="font-mono text-xs text-on-surface-variant mt-0.5">
                @{user?.username || 'admin'}
              </span>
              <span className="mt-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-headline font-semibold bg-surface-container border border-outline-variant/30 text-on-surface">
                Facilities Maintenance Directorate
              </span>
            </div>

            {/* Quick Staff Details */}
            <div className="pt-5 space-y-3.5 text-xs font-sans">
              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">
                  Designation ID
                </span>
                <span className="text-on-surface font-mono font-medium">
                  BWU-STAFF-ADMIN-01
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">
                  Assigned Campus
                </span>
                <span className="text-on-surface font-medium">
                  Main Academic Campus (Barasat)
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">
                  Departmental Duty
                </span>
                <span className="text-on-surface font-medium">
                  Equipment Repair & Fault Escalation
                </span>
              </div>

              <div>
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">
                  Shift Schedule
                </span>
                <span className="text-on-surface font-medium">
                  Monday – Saturday · 08:30 AM – 05:30 PM
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Escalation Protocol Card */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-card space-y-2.5">
            <span className="text-xs font-headline font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
              <span className="text-primary font-bold">🚨</span> Campus Emergency Protocol
            </span>
            <p className="text-xs font-sans text-on-surface-variant leading-relaxed">
              For major electrical hazards, active chemical leaks, or critical server room cooling failures, immediately escalate to Central Campus Operations.
            </p>
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-sans">
              <span className="font-semibold text-on-surface block">Internal Emergency Hotline:</span>
              <span className="font-mono text-primary font-bold text-sm">Ext. 99 / 1800-BWU-OPS</span>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Contact Information Form & Password Security */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Official Contact Details */}
          <Card title="Contact & Office Details" subtitle="Update your official contact information for department communication">
            {profileSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
                <span>{profileSuccess}</span>
                <button
                  type="button"
                  onClick={() => setProfileSuccess(null)}
                  className="text-emerald-700 font-bold hover:opacity-75"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                  Official Communication Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                  Physical Office Location
                </label>
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={savingProfile}
                  disabled={savingProfile}
                >
                  Save Contact Information
                </Button>
              </div>
            </form>
          </Card>

          {/* Card 2: Password & Authentication Security */}
          <Card title="Change Login Password" subtitle="Enforce account security with regular password rotations">
            {passwordSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
                <span>{passwordSuccess}</span>
                <button
                  type="button"
                  onClick={() => setPasswordSuccess(null)}
                  className="text-emerald-700 font-bold hover:opacity-75"
                >
                  ×
                </button>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
                <span>{passwordError}</span>
                <button
                  type="button"
                  onClick={() => setPasswordError(null)}
                  className="text-red-700 font-bold hover:opacity-75"
                >
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
                    className="w-full pl-3.5 pr-14 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-on-surface-variant hover:text-on-surface px-1"
                  >
                    {showCurrent ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Min. 8 chars, 1 number"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-3.5 pr-14 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-on-surface-variant hover:text-on-surface px-1"
                    >
                      {showNew ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-headline font-bold text-on-surface block mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-3.5 pr-14 py-2.5 text-xs font-sans rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-on-surface-variant hover:text-on-surface px-1"
                    >
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-sans text-on-surface-variant/80 block">
                Password must be at least 8 characters long and contain at least one numeric digit (0-9).
              </span>

              <div className="pt-2 flex justify-end">
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

          {/* Card 3: Session & Log Out */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-headline font-bold text-on-surface block">
                Active Administrator Session
              </span>
              <span className="text-xs font-sans text-on-surface-variant mt-0.5 block">
                Authenticated as <span className="font-semibold text-on-surface">{user?.username || 'admin'}</span>. Secure token will expire after period of inactivity.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-error border-error/30 hover:bg-red-50 flex-shrink-0"
            >
              Sign Out of Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
