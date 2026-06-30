import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OPERATIONS', label: 'Operations Staff' },
  { value: 'FINANCE', label: 'Finance Staff' },
  { value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
  { value: 'WAREHOUSE', label: 'Warehouse / Logistics' },
];

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: 'OPERATIONS',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!agree) {
      setError('Please agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full animate-fade-in">
      {/* ── Left: Hero ── */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXlV1M1nA4PhudI27fZW1pM9TyJSSRkACyOXDOXBfHfvYvKbF1aOZqz4OVq6DdjlJAfuDwBjEbA3377kHyi6ZbPgdHw-yptUaqKdAdwlfPxfLOthLnuXlHf4hJMz0vctZvsFroxiFOFjPACKn6V1f9YR4CBUBcNm6A_2kbktt13-eKboq3ljNKUevEpc_9zzNKmXCKcxyrNwwM5HYDd4vffiOHsCyxcN15mvW2dFeBLzXIA6tuiXiCu0p1Mq61X8_OgxvQrw0By2E')" }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 w-full p-14 flex flex-col justify-between">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined material-symbols-filled text-accent text-4xl">local_shipping</span>
              <h1 className="text-headline-xl font-black text-white tracking-tight">LogiFlow</h1>
            </div>
            <p className="mt-4 text-body-lg text-secondary-fixed-dim max-w-md leading-relaxed">
              Global precision at scale. Manage the world's most complex supply chains with real-time intelligence.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="glass-panel p-6 rounded-xl">
              <div className="text-white text-numeric-kpi font-bold">99.9%</div>
              <div className="text-secondary-fixed-dim text-label-md uppercase tracking-widest mt-1">Uptime Precision</div>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <div className="text-white text-numeric-kpi font-bold">2.4M</div>
              <div className="text-secondary-fixed-dim text-label-md uppercase tracking-widest mt-1">Active Shipments</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right: Form ── */}
      <section className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-3xl">local_shipping</span>
            <span className="text-headline-lg font-black text-primary">LogiFlow</span>
          </div>

          <header className="mb-8">
            <h2 className="text-headline-xl text-primary font-bold">Get Started</h2>
            <p className="text-body-md text-on-surface-variant mt-1.5">
              Create your account to access global tracking and fleet management tools.
            </p>
          </header>

          {success ? (
            <div className="glass-panel p-8 text-center animate-slide-up">
              <div className="w-16 h-16 bg-[#d1fae5] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[#065f46] text-3xl material-symbols-filled">check_circle</span>
              </div>
              <h3 className="text-headline-md text-on-surface font-bold">Account Created!</h3>
              <p className="text-body-md text-on-surface-variant mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm animate-slide-up">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="input-label" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">person</span>
                  <input id="name" type="text" className="input-with-icon" placeholder="John Doe" value={form.name} onChange={set('name')} required />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="input-label" htmlFor="email">Work Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">mail</span>
                  <input id="email" type="email" className="input-with-icon" placeholder="john.doe@company.com" value={form.email} onChange={set('email')} required />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="input-label" htmlFor="company">Company Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">business</span>
                  <input id="company" type="text" className="input-with-icon" placeholder="Logistics Global Inc." value={form.company} onChange={set('company')} />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="input-label" htmlFor="role">Department / Role</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">badge</span>
                  <select id="role" className="input-with-icon appearance-none" value={form.role} onChange={set('role')}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="input-label" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock</span>
                  <input id="password" type={showPassword ? 'text' : 'password'} className="input-with-icon pr-11" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" onClick={() => setShowPassword(p => !p)}>
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock_reset</span>
                  <input id="confirmPassword" type={showPassword ? 'text' : 'password'} className="input-with-icon" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" className="mt-0.5 w-4 h-4 rounded border-outline-variant accent-accent" checked={agree} onChange={e => setAgree(e.target.checked)} />
                <label htmlFor="terms" className="text-body-sm text-on-surface-variant leading-snug cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-accent hover:underline font-semibold">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-accent hover:underline font-semibold">Privacy Policy</a>.
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin-slow text-base">progress_activity</span>
                    Preparing Workspace...
                  </>
                ) : 'Create Account'}
              </button>

              <p className="text-center text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-bold hover:underline">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
