import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 2500);
  };

  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = getStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-error', 'bg-[#f59e0b]', 'bg-secondary', 'bg-[#10b981]'];

  return (
    <main className="flex min-h-screen w-full animate-fade-in">
      {/* Left Hero */}
      <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXlV1M1nA4PhudI27fZW1pM9TyJSSRkACyOXDOXBfHfvYvKbF1aOZqz4OVq6DdjlJAfuDwBjEbA3377kHyi6ZbPgdHw-yptUaqKdAdwlfPxfLOthLnuXlHf4hJMz0vctZvsFroxiFOFjPACKn6V1f9YR4CBUBcNm6A_2kbktt13-eKboq3ljNKUevEpc_9zzNKmXCKcxyrNwwM5HYDd4vffiOHsCyxcN15mvW2dFeBLzXIA6tuiXiCu0p1Mq61X8_OgxvQrw0By2E')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute top-10 left-10 z-10">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-4xl">language</span>
            <span className="text-headline-lg font-black text-white">LogiFlow</span>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center glass-panel p-10 rounded-2xl max-w-sm">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-6xl">shield</span>
            <h3 className="text-white text-headline-md font-bold mt-4">Secure Reset</h3>
            <p className="text-primary-fixed-dim text-body-sm mt-2 leading-relaxed">Create a strong password to keep your LogiFlow account secure.</p>
          </div>
        </div>
      </section>

      {/* Right Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center relative p-6 md:p-16 bg-surface">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-3xl">language</span>
            <span className="text-headline-md font-black text-primary">LogiFlow</span>
          </div>

          <div className="glass-panel p-8">
            {done ? (
              <div className="text-center animate-slide-up">
                <div className="w-16 h-16 bg-[#d1fae5] rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[#065f46] text-3xl material-symbols-filled">check_circle</span>
                </div>
                <h2 className="text-headline-lg text-primary font-bold">Password Reset!</h2>
                <p className="text-body-md text-on-surface-variant mt-2">Your password has been updated. Redirecting to login...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-on-primary-fixed text-2xl material-symbols-filled">key</span>
                  </div>
                  <h2 className="text-headline-xl text-primary font-bold">Reset Password</h2>
                  <p className="text-body-md text-on-surface-variant mt-1.5">Create a strong new password for your account.</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="input-label" htmlFor="password">New Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock</span>
                      <input
                        id="password"
                        type={showPwd ? 'text' : 'password'}
                        className="input-with-icon pr-11"
                        placeholder="Min. 6 characters"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        required
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" onClick={() => setShowPwd(p => !p)}>
                        <span className="material-symbols-outlined text-xl">{showPwd ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                    {/* Strength meter */}
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-surface-container'}`} />
                          ))}
                        </div>
                        <p className={`text-xs mt-1 font-medium transition-colors ${strength <= 1 ? 'text-error' : strength === 2 ? 'text-[#f59e0b]' : strength === 3 ? 'text-secondary' : 'text-[#10b981]'}`}>
                          {strengthLabels[strength]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="input-label" htmlFor="confirm">Confirm New Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock_reset</span>
                      <input
                        id="confirm"
                        type={showPwd ? 'text' : 'password'}
                        className="input-with-icon"
                        placeholder="Repeat new password"
                        value={form.confirm}
                        onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                        required
                      />
                      {form.confirm && (
                        <span className={`material-symbols-outlined material-symbols-filled absolute right-3 top-1/2 -translate-y-1/2 text-xl ${form.password === form.confirm ? 'text-[#10b981]' : 'text-error'}`}>
                          {form.password === form.confirm ? 'check_circle' : 'cancel'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-accent w-full">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin-slow text-base">progress_activity</span>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">lock_reset</span>
                        Reset Password
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link to="/login" className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
