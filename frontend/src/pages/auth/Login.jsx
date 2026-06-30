import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full animate-fade-in">
      {/* ── Left: Hero ── */}
      <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[20s] hover:scale-100"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABKoF8hkgDnPPf-g9sROi-4srcudMR4Fb8E0ylnK8cy2dBmm4NQLwQSAbjzCwDf69q0d03LcaMXwu7OE2zvKhhSJR7M9V4zdPOB-K6-CzOubZV8Q4-73O9Ft9fVTYVHnZwY5-oR7Yil6gFXWCPgCats9vjSWHuKrt14ANV-6AXmBhqF3xGjD1m638rSjlouPAVtPyqYHH5mUCGi6irHMU4trwGs6t6y5HW1EZqVwKo0o3o6hP1PHvnS5Fmy_uzQJIvMu_aF6Wf0a0')" }}
        />
        <div className="absolute inset-0 hero-overlay-tr" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-primary/80" />

        {/* Brand anchor */}
        <div className="absolute top-10 left-10 z-10">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-4xl">language</span>
            <h1 className="text-headline-lg font-black text-white tracking-tight">LogiFlow</h1>
          </div>
          <p className="text-primary-fixed-dim text-body-sm mt-2 max-w-xs leading-relaxed">
            Intelligent routing and real-time cargo tracking for global supply chains.
          </p>
        </div>

        {/* Bottom quote */}
        <div className="absolute bottom-10 left-10 right-10 z-10">
          <div className="glass-panel p-6">
            <p className="text-white text-body-md font-medium italic leading-relaxed">
              "Connecting the world's cargo with precision and speed."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent text-sm">local_shipping</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">LogiFlow Platform</p>
                <p className="text-primary-fixed-dim text-xs">v2.0 Enterprise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right: Form ── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center relative p-6 md:p-16 bg-surface">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-3xl">language</span>
            <span className="text-headline-md font-black text-primary">LogiFlow</span>
          </div>

          {/* Glassmorphic card */}
          <div className="glass-panel p-8">
            <div className="mb-8">
              <h2 className="text-headline-xl text-primary font-bold">Welcome Back</h2>
              <p className="text-on-surface-variant text-body-md mt-1">Sign in to access your command center.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm animate-slide-up">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
              {/* Email */}
              <div>
                <label className="input-label" htmlFor="email">Work Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">mail</span>
                  <input
                    id="email"
                    type="email"
                    className="input-with-icon"
                    placeholder="operations@company.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="input-label" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-with-icon pr-11"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-outline-variant accent-accent"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span className="text-body-sm text-on-surface-variant">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-label-md text-accent hover:underline transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-accent mt-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin-slow text-base relative z-10">progress_activity</span>
                    <span className="relative z-10">Authenticating...</span>
                  </>
                ) : (
                  <span className="relative z-10">Sign In to Workspace</span>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 text-xs text-on-surface-variant">or</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <Link
                to="/track-parcel"
                className="flex items-center justify-center gap-2 border border-outline-variant text-[#009adb] hover:text-[#009adb]/85 font-semibold text-sm py-2.5 rounded-lg hover:bg-surface-container-low transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">location_searching</span>
                Track a Parcel
              </Link>

            </form>

            <div className="mt-6 text-center">
              <p className="text-body-sm text-on-surface-variant">
                Need an account?{' '}
                <Link to="/signup" className="text-label-md text-accent hover:underline">
                  Register here
                </Link>
              </p>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-5 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
              <p className="text-xs font-semibold text-on-surface-variant mb-1">Demo Credentials:</p>
              <p className="text-xs text-outline font-mono">admin@logiflow.com / admin123</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
