import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input } from '../components/FormField';

export default function ProfilePage() {
  const { user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <div className="max-w-3xl space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight">
          Admin Profile & Security
        </h2>
        <p className="text-sm font-sans text-on-surface-variant mt-1">
          Manage your administrator account credentials and view system status.
        </p>
      </div>

      {/* Account Info Card */}
      <Card title="Account Overview">
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/20">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline font-extrabold text-2xl shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              {user?.username || 'Administrator'}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-headline font-semibold bg-primary/10 text-primary border border-primary/20 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Facilities Maintenance Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs font-sans text-on-surface-variant">
          <div>
            <span className="font-headline font-bold uppercase tracking-wider text-outline block mb-1">
              Account ID
            </span>
            <span className="font-mono text-on-surface text-xs block truncate">
              {user?.id || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-headline font-bold uppercase tracking-wider text-outline block mb-1">
              Security Level
            </span>
            <span className="text-on-surface font-semibold block">
              Full System Access (Reports & Maintenance)
            </span>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card title="Change Password" subtitle="Enforce account security with regular password updates">
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-status-resolved/30 text-status-resolved text-xs font-medium flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-status-resolved font-bold">
              ×
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-status-rejected/30 text-status-rejected text-xs font-medium flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-status-rejected font-bold">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <Input
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Min. 8 characters with at least 1 number"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Must be at least 8 characters long and contain at least 1 number"
            required
          />

          <Input
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

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
    </div>
  );
}
