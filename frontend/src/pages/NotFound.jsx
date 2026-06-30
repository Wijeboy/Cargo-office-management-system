import { Link, useNavigate, useLocation } from 'react-router-dom';

const CONTAINER_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBfuOIXZHd-Cye9uAi_32PSuo8xnTRxyuQ66idFVNr1TVo2o3hp_0tjPwwJ43pSy-tTEiQEMz4TaOHv0MGfBHwgxg-pwHOR9QZUBgKAtGiGqbc-vNNmOZ9WrAqWPfBX1TDi3ed5HkXqK8hPZRcJh6---HssbF3MG54Dhp_Z3kpxMCX2rW2kFOAM3UjN7D2PvZH7nWwoxyeHOImV1S8Hg6asCtirkCbRo4J79pxnU3x1yHV1SnMLFtDDxmnpuVTDASdQe8Mvb7JGBQA";

export default function NotFound() {
  const navigate  = useNavigate();
  const location  = useLocation();
  // If redirected from public tracking, show the bad code
  const badCode   = location.state?.trackingCode;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-['Inter']">

      {/* ── Minimal brand header ── */}
      <header className="fixed top-0 right-0 left-0 z-30 flex justify-between items-center px-10 h-16 backdrop-blur-xl bg-surface/70 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#009adb]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_shipping
          </span>
          <span className="text-lg font-bold text-primary">LogiFlow</span>
        </div>
      </header>

      {/* ── Main canvas ── */}
      <main className="flex-grow flex items-center justify-center pt-16 px-6 md:px-10">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">

          {/* ── Left: Text & Actions ── */}
          <div className="flex flex-col gap-8 order-2 md:order-1 text-center md:text-left">
            <div className="space-y-2">
              {/* ERROR 404 label */}
              <span className="text-2xl font-black tracking-widest text-[#009adb] leading-none">
                ERROR 404
              </span>

              {/* Main heading */}
              <h1 className="text-4xl font-bold text-primary mt-2 leading-tight">
                Shipment Not Found
              </h1>

              {/* Description — contextual if coming from tracker */}
              <p className="text-lg text-on-surface-variant mt-4 max-w-md mx-auto md:mx-0 leading-relaxed">
                {badCode ? (
                  <>
                    No shipment found for tracking code{' '}
                    <span className="font-mono font-bold text-on-surface">"{badCode}"</span>.
                    {' '}The container may have drifted off our network. Please check the code and try again.
                  </>
                ) : (
                  "It looks like the container you are tracking has drifted off course. The page you requested cannot be located in our logistics network."
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {badCode ? (
                /* Came from public track page — go back there */
                <>
                  <Link
                    to="/track-parcel"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#009adb] text-white font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,154,219,0.4)]"
                  >
                    <span className="material-symbols-outlined text-lg">location_searching</span>
                    Try Another Code
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded border border-outline-variant text-secondary font-semibold text-sm tracking-wide hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">login</span>
                    Sign In
                  </Link>
                </>
              ) : (
                /* Generic 404 — go to dashboard or support */
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#009adb] text-white font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,154,219,0.4)]"
                  >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    Return to Dashboard
                  </Link>
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded border border-outline-variant text-secondary font-semibold text-sm tracking-wide hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                    Contact Support
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Right: Floating container illustration ── */}
          <div className="order-1 md:order-2 flex justify-center relative h-[280px] md:h-[400px]">
            {/* Blurred radial glow */}
            <div className="absolute inset-0 bg-secondary-container/20 rounded-full blur-3xl transform scale-75 pointer-events-none" />

            <img
              src={CONTAINER_IMG}
              alt="Lost orange shipping container floating in the ocean"
              className="object-contain w-full h-full z-10"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            />
          </div>

        </div>
      </main>

      {/* Float keyframe */}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
