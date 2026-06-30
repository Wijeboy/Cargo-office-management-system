import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function MyProfile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    company: 'LogiFlow Logistics Corp.',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    updateProfile({ name: form.name, phone: form.phone });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const ROLE_LABELS = {
    ADMIN: 'Administrator',
    OPERATIONS: 'Operations Staff',
    FINANCE: 'Finance Staff',
    CUSTOMER_SERVICE: 'Customer Service',
    WAREHOUSE: 'Warehouse / Logistics',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and account settings.</p>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-3 bg-[#d1fae5] text-[#065f46] px-5 py-3 rounded-xl animate-slide-up">
          <span className="material-symbols-outlined material-symbols-filled">check_circle</span>
          <span className="font-semibold text-body-sm">Profile updated successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="card p-6">
        {/* Avatar + role */}
        <div className="flex items-center gap-5 pb-6 border-b border-outline-variant">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-2xl font-black text-on-primary shadow-card-hover">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-sm hover:bg-on-tertiary-fixed-variant transition-colors">
              <span className="material-symbols-outlined text-white text-xs">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-headline-md text-on-surface font-bold">{user?.name}</h2>
            <p className="text-on-surface-variant text-body-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-info">
                <span className="material-symbols-outlined text-xs material-symbols-filled">badge</span>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
              <span className="badge badge-success">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Active
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(p => !p)}
            className={editing ? 'btn-secondary text-sm py-2 px-4' : 'btn-primary text-sm py-2 px-4'}
          >
            <span className="material-symbols-outlined text-base">{editing ? 'close' : 'edit'}</span>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Info form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">person</span>
                <input
                  type="text"
                  className="input-with-icon"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  disabled={!editing}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Work Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">mail</span>
                <input type="email" className="input-with-icon opacity-60 cursor-not-allowed" value={form.email} disabled />
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">phone</span>
                <input
                  type="tel"
                  className="input-with-icon"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  disabled={!editing}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Department</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">business</span>
                <input type="text" className="input-with-icon opacity-60 cursor-not-allowed" value={form.department || '—'} disabled />
              </div>
            </div>
          </div>

          {/* Role badge (read-only) */}
          <div className="p-4 bg-surface-container-low rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container material-symbols-filled">security</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Access Level: {ROLE_LABELS[user?.role]}</p>
              <p className="text-xs text-on-surface-variant">Role can only be changed by an Administrator.</p>
            </div>
          </div>

          {editing && (
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin-slow text-base">progress_activity</span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Save Changes
                </>
              )}
            </button>
          )}
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h3 className="text-body-lg font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined material-symbols-filled text-on-surface-variant">lock</span>
          Change Password
        </h3>
        <div className="space-y-4">
          {[
            { id: 'current', label: 'Current Password', icon: 'lock', key: 'current' },
            { id: 'next', label: 'New Password', icon: 'lock_reset', key: 'next' },
            { id: 'confirm', label: 'Confirm New Password', icon: 'lock_reset', key: 'confirm' },
          ].map(field => (
            <div key={field.id}>
              <label className="input-label" htmlFor={field.id}>{field.label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">{field.icon}</span>
                <input
                  id={field.id}
                  type={showPwd ? 'text' : 'password'}
                  className="input-with-icon pr-11"
                  placeholder="••••••••"
                  value={pwdForm[field.key]}
                  onChange={e => setPwdForm(p => ({ ...p, [field.key]: e.target.value }))}
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowPwd(p => !p)}
            type="button"
            className="text-xs text-accent hover:underline font-medium"
          >
            {showPwd ? 'Hide' : 'Show'} passwords
          </button>
          <button className="btn-secondary w-full mt-2">
            <span className="material-symbols-outlined text-base">key</span>
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
