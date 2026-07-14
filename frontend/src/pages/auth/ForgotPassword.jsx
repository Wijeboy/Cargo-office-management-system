import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5001';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoCode, setDemoCode] = useState(''); // helper to show generated code on screen for demo
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Send recovery code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No user found with this email.');
      }

      setDemoCode(data.demoCode || '');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify reset OTP code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid code.');
      }

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <span className="text-white text-body-sm font-medium">Reset verification expires in 15 minutes</span>
          </div>
        </div>
      </section>

      {/* Right Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center relative p-6 md:p-16 bg-surface">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="material-symbols-outlined material-symbols-filled text-accent text-3xl">language</span>
            <span className="text-headline-md font-black text-primary">LogiFlow</span>
          </div>

          <div className="glass-panel p-8">
            {error && (
              <div className="mb-5 flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm animate-slide-up">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-on-secondary-container text-2xl material-symbols-filled">lock_reset</span>
                  </div>
                  <h2 className="text-headline-xl text-primary font-bold">Forgot Password?</h2>
                  <p className="text-body-md text-on-surface-variant mt-1.5">
                    No worries. Enter your work email and we'll send you a secure reset verification code.
                  </p>
                </div>

                <form onSubmit={handleSendCode} className="space-y-5">
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

                  <button type="submit" disabled={loading} className="btn-accent w-full h-12">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin-slow text-base mr-2">progress_activity</span>
                        Sending Reset Code...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base mr-2">send</span>
                        Send Verification Code
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link to="/login" className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* STEP 2: Enter Verification OTP */}
            {step === 2 && (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-on-secondary-container text-2xl material-symbols-filled">vpn_key</span>
                  </div>
                  <h2 className="text-headline-xl text-primary font-bold">Enter Verification Code</h2>
                  <p className="text-body-md text-on-surface-variant mt-1.5">
                    We've sent a 6-digit recovery code to <strong className="text-on-surface">{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="input-label" htmlFor="otp">Verification Code</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">security</span>
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        className="input-with-icon font-mono tracking-widest text-center"
                        placeholder="••••••"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {demoCode && (
                    <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30 text-center">
                      <p className="text-xs font-semibold text-on-surface-variant">Demo Code received:</p>
                      <p className="text-sm font-bold text-accent font-mono tracking-wider mt-1">{demoCode}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-accent w-full h-12">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin-slow text-base mr-2">progress_activity</span>
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base mr-2">verified</span>
                        Verify Reset Code
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button type="button" onClick={() => setStep(1)} className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1 mx-auto">
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Back to Email Form
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 3 && (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-on-secondary-container text-2xl material-symbols-filled">password</span>
                  </div>
                  <h2 className="text-headline-xl text-primary font-bold">Choose New Password</h2>
                  <p className="text-body-md text-on-surface-variant mt-1.5">
                    Your reset code is verified. Set your new secure account password below.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="input-label" htmlFor="new-password">New Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock</span>
                      <input
                        id="new-password"
                        type="password"
                        className="input-with-icon"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label" htmlFor="confirm-password">Confirm Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">lock</span>
                      <input
                        id="confirm-password"
                        type="password"
                        className="input-with-icon"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-accent w-full h-12">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin-slow text-base mr-2">progress_activity</span>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base mr-2">check_circle</span>
                        Save New Password
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: Success Message */}
            {step === 4 && (
              <div className="text-center animate-slide-up">
                <div className="w-16 h-16 bg-success-container rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-success text-3xl material-symbols-filled">check_circle</span>
                </div>
                <h2 className="text-headline-lg text-primary font-bold">Password Reset Successful</h2>
                <p className="text-body-md text-on-surface-variant mt-3 leading-relaxed">
                  Your password has been successfully updated. You can now log in using your new credentials.
                </p>
                <Link to="/login" className="btn-primary w-full mt-6 h-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base mr-2">login</span>
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
