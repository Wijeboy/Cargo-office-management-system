import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <main className="flex min-h-screen w-full animate-fade-in">
      {/* Left Hero */}
      <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABKoF8hkgDnPPf-g9sROi-4srcudMR4Fb8E0ylnK8cy2dBmm4NQLwQSAbjzCwDf69q0d03LcaMXwu7OE2zvKhhSJR7M9V4zdPOB-K6-CzOubZV8Q4-73O9Ft9fVTYVHnZwY5-oR7Yil6gFXWCPgCats9vjSWHuKrt14ANV-6AXmBhqF3xGjD1m638rSjlouPAVtPyqYHH5mUCGi6irHMU4trwGs6t6y5HW1EZqVwKo0o3o6hP1PHvnS5Fmy_uzQJIvMu_aF6Wf0a0')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute top-10 left-10 z-10">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-4xl">language</span>
            <span className="text-headline-lg font-black text-white">LogiFlow</span>
          </div>
          <p className="text-primary-fixed-dim text-body-sm mt-2 max-w-xs">Account recovery for the global logistics platform.</p>
        </div>
        <div className="absolute bottom-10 left-10 z-10 space-y-3">
          <div className="flex items-center gap-3 glass-panel px-4 py-3 rounded-xl">
            <span className="material-symbols-outlined text-accent material-symbols-filled">security</span>
            <span className="text-white text-body-sm font-medium">Secure account recovery</span>
          </div>
          <div className="flex items-center gap-3 glass-panel px-4 py-3 rounded-xl">
            <span className="material-symbols-outlined text-accent material-symbols-filled">timer</span>
            <span className="text-white text-body-sm font-medium">Reset link expires in 15 minutes</span>
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
            {sent ? (
              <div className="text-center animate-slide-up">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl material-symbols-filled">mark_email_read</span>
                </div>
                <h2 className="text-headline-lg text-primary font-bold">Check Your Email</h2>
                <p className="text-body-md text-on-surface-variant mt-3 leading-relaxed">
                  We've sent a password reset link to <strong className="text-on-surface">{email}</strong>. Check your inbox and follow the instructions.
                </p>
                <div className="mt-6 p-4 bg-surface-container rounded-lg text-body-sm text-on-surface-variant">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button onClick={() => setSent(false)} className="text-accent font-semibold hover:underline">try again</button>.
                </div>
                <Link to="/login" className="btn-primary w-full mt-6">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-on-secondary-container text-2xl material-symbols-filled">lock_reset</span>
                  </div>
                  <h2 className="text-headline-xl text-primary font-bold">Forgot Password?</h2>
                  <p className="text-body-md text-on-surface-variant mt-1.5">
                    No worries. Enter your work email and we'll send you a secure reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="input-label" htmlFor="email">Work Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">mail</span>
                      <input
                        id="email"
                        type="email"
                        className="input-with-icon"
                        placeholder="operations@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-accent w-full">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin-slow text-base">progress_activity</span>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        Send Reset Link
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
