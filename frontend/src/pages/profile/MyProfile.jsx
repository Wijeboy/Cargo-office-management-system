import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBIj5IG2xOPWjl0ZXa9F_cexiMnwAxtafXLxD-oAgYJybBpg8NJSbjcasreOd_w4A2bTCUB3_8ZcLLWNkm03YbKeref0ZAFvJjZ2NN9GCFBFKryGI1uZ4LnKhQdgWXhAQqUQFJC4SqUqpE8OE-5WUqJwLmw4WpZ-nAxL2C8ywh2cwWYZvO39D1PT6skf1xJqLEmzISb6zICBPb7mlMsjbgyzmNaJzChKRnppaaz7BW7PWZ0zi2U2fiTRkraPFVHxXcVBnKQZblt2Iw";

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  OPERATIONS: 'Operations Staff',
  FINANCE: 'Finance Staff',
  CUSTOMER_SERVICE: 'Customer Service',
  WAREHOUSE: 'Warehouse / Logistics',
  CUSTOMER: 'Customer',
};

const API_URL = 'http://localhost:5001';

export default function MyProfile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form state
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'Asia/Colombo (IST+5:30)',
    bio: user?.bio || '',
    department: user?.department || '',
    location: user?.location || 'Main Campus - Headquarters',
  });

  // Settings states
  const [twoFA, setTwoFA] = useState(user?.twoFA || false);
  const [notifPrefs, setNotifPrefs] = useState({
    systemAlerts: user?.prefSystemAlerts ?? true,
    weeklyReport: user?.prefWeeklyReport ?? true,
    betaFeatures: user?.prefBetaFeatures ?? false,
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  // Password Reset fields
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Sync state with loaded user
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        timezone: user.timezone || 'Asia/Colombo (IST+5:30)',
        bio: user.bio || '',
        department: user.department || '',
        location: user.location || 'Main Campus - Headquarters',
      });
      setTwoFA(user.twoFA || false);
      setNotifPrefs({
        systemAlerts: user.prefSystemAlerts ?? true,
        weeklyReport: user.prefWeeklyReport ?? true,
        betaFeatures: user.prefBetaFeatures ?? false,
      });
    }
  }, [user]);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  // Profile Save
  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    setSuccessMessage('');
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        timezone: form.timezone,
        bio: form.bio,
        location: form.location
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Avatar camera trigger and upload
  const handleAvatarClick = () => {
    document.getElementById('avatar-upload-input').click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size should be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setSaving(true);
      setFormError('');
      setSuccessMessage('');
      try {
        await updateProfile({ avatar: base64Data });
        setSuccessMessage('Profile photo updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setFormError(err.message || 'Failed to upload profile photo.');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // 2FA Dynamic Save
  const handleTwoFAToggle = async (e) => {
    const enabled = e.target.checked;
    setTwoFA(enabled);
    setFormError('');
    try {
      await updateProfile({ twoFA: enabled });
      setSuccessMessage(enabled ? 'Two-Factor Authentication enabled!' : 'Two-Factor Authentication disabled!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to toggle 2FA.');
      setTwoFA(!enabled);
    }
  };

  // Preference Dynamic Save
  const handlePrefChange = (key) => async (e) => {
    const enabled = e.target.checked;
    setNotifPrefs(prev => ({ ...prev, [key]: enabled }));
    setFormError('');

    const dbField = key === 'systemAlerts' ? 'prefSystemAlerts'
                  : key === 'weeklyReport' ? 'prefWeeklyReport'
                  : 'prefBetaFeatures';

    try {
      await updateProfile({ [dbField]: enabled });
    } catch (err) {
      setFormError(err.message || 'Failed to update preferences.');
      setNotifPrefs(prev => ({ ...prev, [key]: !enabled }));
    }
  };

  // Reset Password Action
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    const token = localStorage.getItem('lf_token');
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Connection to server failed.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Account Deactivation Action
  const handleDeactivateAccount = async () => {
    const confirmPrompt = `WARNING: This will deactivate your LogiFlow account. You will not be able to log in until an administrator re-enables your account. Are you sure you want to proceed?`;
    if (confirm(confirmPrompt)) {
      const token = localStorage.getItem('lf_token');
      try {
        const response = await fetch(`${API_URL}/api/auth/deactivate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          alert('Your account has been deactivated. Logging out...');
          logout();
          navigate('/login');
        } else {
          setFormError(data.message || 'Failed to deactivate account.');
        }
      } catch (err) {
        setFormError('Failed to connect to backend.');
      }
    }
  };

  // View Public Profile Link Action
  const handleViewPublicProfile = () => {
    const profileLink = `${window.location.origin}/profile/${user?.id || 'public'}`;
    navigator.clipboard.writeText(profileLink);
    setSuccessMessage('Public profile link copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="animate-fade-in">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        id="avatar-upload-input"
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />

      {/* ── Hero Cover Banner ── */}
      <div className="relative -mx-6 -mt-6 mb-0">
        <div
          className="h-52 w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url('${HERO_IMG}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        </div>

        {/* Avatar + name overlap */}
        <div className="max-w-5xl mx-auto px-6 relative -mt-16 flex flex-col sm:flex-row items-end gap-5 pb-6 border-b border-outline-variant">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full border-4 border-surface shadow-xl overflow-hidden bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-4xl font-black text-on-primary">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button onClick={handleAvatarClick} className="absolute bottom-1 right-1 w-8 h-8 bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>

          {/* Name + role */}
          <div className="flex-1 mb-1 min-w-0">
            <h1 className="text-headline-xl text-on-surface font-bold truncate">{user?.name}</h1>
            <p className="text-body-md text-on-surface-variant font-medium">
              {ROLE_LABELS[user?.role]} &bull; {form.location}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-1 flex-shrink-0">
            <button onClick={handleViewPublicProfile} className="btn-secondary text-sm py-2 px-4 h-10">
              View Public Profile
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm py-2 px-4 h-10"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin-slow text-sm">progress_activity</span>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <span className="material-symbols-outlined text-sm">check</span>
                  Saved!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Alerts Banner ── */}
      <div className="max-w-5xl mx-auto px-0 pt-6">
        {formError && (
          <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm animate-slide-up">
            <span className="material-symbols-outlined text-base">error</span>
            {formError}
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-3 bg-[#d1fae5] text-[#065f46] px-4 py-3 rounded-lg text-body-sm animate-slide-up">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {successMessage}
          </div>
        )}
      </div>

      {/* ── Main 3-column grid ── */}
      <div className="max-w-5xl mx-auto px-0 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Account Overview */}
            <div className="card p-6">
              <h3 className="text-headline-md text-on-surface font-semibold mb-5">Account Overview</h3>
              <div className="space-y-4">
                {[
                  { icon: 'verified_user', bg: 'bg-secondary-fixed', color: 'text-primary', label: 'Account Status', value: 'Verified Enterprise User' },
                  { icon: 'calendar_today', bg: 'bg-tertiary-fixed', color: 'text-tertiary', label: 'Joined', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
                  { icon: 'local_shipping', bg: 'bg-primary-fixed', color: 'text-primary', label: 'Department', value: user?.department || 'Administration' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                      <p className="text-body-sm font-semibold text-on-surface mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Section */}
            <div className="card p-6">
              <h3 className="text-headline-md text-on-surface font-semibold mb-5">Security</h3>
              <div className="space-y-4">
                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                    <p className="text-body-sm font-medium text-on-surface">Two-Factor Auth</p>
                  </div>
                  <label className="relative inline-block w-10 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={twoFA}
                      onChange={handleTwoFAToggle}
                    />
                    <div className="w-10 h-6 bg-outline-variant peer-checked:bg-primary rounded-full transition-colors" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
                  </label>
                </div>

                <button onClick={() => setIsPasswordModalOpen(true)} className="w-full py-2.5 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
                  Reset Password
                </button>

                <button onClick={() => setIsSessionsModalOpen(true)} className="w-full py-2.5 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">devices</span>
                  Active Sessions
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column (2 cols) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Personal Information */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-headline-lg text-on-surface font-semibold">Personal Information</h3>
                <span className="text-body-sm text-on-surface-variant">Fields with * are required</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Full Name *</label>
                  <input type="text" className="input-field" value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className="input-label">Email Address *</label>
                  <input type="email" className="input-field opacity-60 cursor-not-allowed" value={form.email} disabled />
                  <p className="text-xs text-on-surface-variant mt-1">Contact admin to change email.</p>
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input type="tel" className="input-field" value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" />
                </div>
                <div>
                  <label className="input-label">Timezone</label>
                  <select className="input-field appearance-none" value={form.timezone} onChange={set('timezone')}>
                    <option>Asia/Colombo (IST+5:30)</option>
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>GMT / UTC</option>
                  </select>
                </div>
              </div>
              <div className="mt-5">
                <label className="input-label">Professional Bio</label>
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="Tell us about your experience..."
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="card p-8">
              <h3 className="text-headline-lg text-on-surface font-semibold mb-6">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Department</label>
                  <input type="text" className="input-field opacity-60 cursor-not-allowed" value={user?.department || '—'} disabled />
                </div>
                <div>
                  <label className="input-label">Current Role</label>
                  <input type="text" className="input-field opacity-60 cursor-not-allowed" value={ROLE_LABELS[user?.role] || user?.role} disabled />
                </div>
                <div>
                  <label className="input-label">Office Location</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">location_on</span>
                    <input type="text" className="input-with-icon" value={form.location} onChange={set('location')} />
                  </div>
                </div>
                <div>
                  <label className="input-label">Access Level</label>
                  <div className="flex items-center gap-3 input-field opacity-60">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                    <span className="text-body-sm text-on-surface">{ROLE_LABELS[user?.role]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="card p-8">
              <h3 className="text-headline-lg text-on-surface font-semibold mb-6">Communication Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'systemAlerts', title: 'System Alerts', desc: 'Receive real-time notifications about shipment status and emergency updates.' },
                  { key: 'weeklyReport', title: 'Weekly Analytics Summary', desc: 'Get a compiled report of cargo performance every Monday morning.' },
                  { key: 'betaFeatures', title: 'Beta Features', desc: 'Early access invitations to test new LogiFlow modules before public release.' },
                ].map(pref => (
                  <div key={pref.key} className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                      checked={notifPrefs[pref.key]}
                      onChange={handlePrefChange(pref.key)}
                    />
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{pref.title}</p>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">{pref.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-surface rounded-xl border border-error-container p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-body-md font-bold text-error">Danger Zone</h4>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Deactivating your account is permanent and cannot be undone.
                  </p>
                </div>
                <button onClick={handleDeactivateAccount} className="btn-ghost border border-error text-error hover:bg-error-container hover:text-on-error-container flex-shrink-0 text-sm py-2 px-4">
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reset Password Modal ── */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-card-hover overflow-hidden animate-slide-up">
            <header className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Reset Security Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="btn-ghost p-1"><span className="material-symbols-outlined">close</span></button>
            </header>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-2.5 rounded-lg text-xs">
                  <span className="material-symbols-outlined text-base">error</span>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-3 bg-[#d1fae5] text-[#065f46] px-4 py-2.5 rounded-lg text-xs">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Password updated successfully!
                </div>
              )}

              <div>
                <label className="input-label" htmlFor="cur-pass">Current Password *</label>
                <input id="cur-pass" type="password" className="input-field" placeholder="••••••••" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} required />
              </div>

              <div>
                <label className="input-label" htmlFor="new-pass">New Password *</label>
                <input id="new-pass" type="password" className="input-field" placeholder="••••••••" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} required />
              </div>

              <div>
                <label className="input-label" htmlFor="conf-pass">Confirm New Password *</label>
                <input id="conf-pass" type="password" className="input-field" placeholder="••••••••" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>

              <footer className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                <button type="submit" disabled={passwordSubmitting} className="btn-primary text-sm py-2 px-4">
                  {passwordSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ── Active Sessions Modal ── */}
      {isSessionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-card-hover overflow-hidden animate-slide-up">
            <header className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Active Devices & Sessions</h2>
              <button onClick={() => setIsSessionsModalOpen(false)} className="btn-ghost p-1"><span className="material-symbols-outlined">close</span></button>
            </header>

            <div className="p-6 space-y-4">
              <p className="text-body-sm text-on-surface-variant">Here are the web browsers and mobile apps currently signed in to your account. You can log out of other sessions if needed.</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-accent text-2xl">desktop_mac</span>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold text-on-surface">Safari on macOS (Current device)</p>
                    <p className="text-xs text-on-surface-variant">IP: 192.168.1.45 &bull; Active now</p>
                  </div>
                  <span className="badge badge-success text-[10px]">Current</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">phone_iphone</span>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold text-on-surface">LogiFlow App (iPhone 15 Pro)</p>
                    <p className="text-xs text-on-surface-variant">IP: 103.22.45.101 &bull; Active 4 mins ago</p>
                  </div>
                  <button onClick={() => alert('Session terminated successfully.')} className="btn-ghost p-1.5 text-error hover:bg-error-container"><span className="material-symbols-outlined text-sm">logout</span></button>
                </div>
              </div>

              <footer className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => setIsSessionsModalOpen(false)} className="btn-secondary text-sm py-2 px-4">Close</button>
                <button type="button" onClick={() => { alert('Other sessions revoked successfully!'); setIsSessionsModalOpen(false); }} className="btn-primary text-sm py-2 px-4">Revoke Other Devices</button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-0 py-10 mt-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-on-surface-variant">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-outline" fill="none" viewBox="0 0 48 48"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"/></svg>
          <span className="text-sm font-medium">LogiFlow v2.0.0</span>
        </div>
        <div className="flex gap-5 text-sm">
          {['Support Center', 'Privacy Policy', 'Terms of Service'].map(l => (
            <a key={l} href="#" className="hover:text-primary transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-sm">© 2024 LogiFlow Systems Inc.</p>
      </div>
    </div>
  );
}
