import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_SHIPMENTS, MOCK_TRACKING_EVENTS } from '../../data/mockData';

/* ── Milestone order & labels ──────────────────────────── */
const MILESTONE_ORDER = ['PENDING', 'PICKED_UP', 'PROCESSING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const MILESTONE_LABELS = {
  PENDING:          'Booked',
  PICKED_UP:        'Picked Up',
  PROCESSING:       'Processing',
  IN_TRANSIT:       'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
};

const SHIP_STATUS_BADGE = {
  IN_TRANSIT:       { label: 'In Transit',       cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  DELIVERED:        { label: 'Delivered',         cls: 'bg-[#d1fae5] text-[#065f46]' },
  DELAYED:          { label: 'Delayed',           cls: 'bg-error-container text-on-error-container' },
  PENDING:          { label: 'Booked',            cls: 'bg-secondary-container text-on-secondary-container' },
  CANCELLED:        { label: 'Cancelled',         cls: 'bg-error-container text-on-error-container' },
};

function getMilestoneIdx(events) {
  if (!events?.length) return 0;
  const last = events[events.length - 1].status;
  const idx  = MILESTONE_ORDER.indexOf(last);
  return idx === -1 ? 1 : idx;
}

export default function PublicTrackCargo() {
  const navigate = useNavigate();
  const [query,    setQuery]    = useState('');
  const [shipment, setShipment] = useState(null);
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(false);

  /* ── Search handler ── */
  const handleTrack = async (e) => {
    e?.preventDefault();
    const code = query.trim();
    if (!code) return;

    setLoading(true);
    setShipment(null);
    setEvents([]);

    await new Promise(r => setTimeout(r, 900));

    const found = MOCK_SHIPMENTS.find(
      s => s.shipmentCode.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setShipment(found);
      setEvents(MOCK_TRACKING_EVENTS[found.shipmentCode] || []);
    } else {
      // ── Navigate to 404 page ──
      navigate('/not-found', { state: { trackingCode: code } });
      return;
    }
    setLoading(false);
  };

  const milestoneIdx = getMilestoneIdx(events);
  const badge        = SHIP_STATUS_BADGE[shipment?.status] || SHIP_STATUS_BADGE.PENDING;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-['Inter'] relative">

      {/* ── Dot-grid background ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#c4c6cd 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '-12px -12px',
        }}
      />

      {/* ── Frosted navbar ── */}
      <nav className="fixed top-0 right-0 left-0 z-30 flex justify-between items-center px-10 h-16 backdrop-blur-xl bg-surface/70 border-b border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-2xl font-bold text-[#009adb]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_shipping
          </span>
          <span className="text-lg font-black text-primary">LogiFlow</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">login</span>
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-grow pt-28 pb-16 px-6 md:px-10 flex flex-col items-center justify-start z-10 relative">

        {/* Header */}
        <div className="w-full max-w-3xl text-center mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tight leading-tight">
            Track Your Shipment
          </h1>
          <p className="text-lg text-on-surface-variant mt-3 leading-relaxed">
            Enter your tracking ID to monitor your cargo in real-time.
          </p>
        </div>

        {/* ── Search bar ── */}
        <form
          onSubmit={handleTrack}
          className="w-full max-w-3xl"
        >
          <div
            className="relative flex items-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-2 shadow-lg transition-all duration-300 focus-within:shadow-[0_0_8px_rgba(0,154,219,0.35)] focus-within:border-[#009adb]/40"
          >
            <span className="material-symbols-outlined text-outline ml-4 mr-2 flex-shrink-0">search</span>
            <input
              className="flex-grow bg-transparent border-none focus:ring-0 text-lg text-primary placeholder:text-outline-variant py-3 outline-none font-medium"
              placeholder="e.g. LOG-2401"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#009adb] text-white rounded-lg px-8 py-3 text-sm font-bold flex-shrink-0 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,154,219,0.4)] disabled:opacity-60"
            >
              {loading
                ? <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                : 'Track'}
            </button>
          </div>

          {/* Quick-try chips */}
          <div className="mt-3 flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs text-on-surface-variant">Try:</span>
            {['LOG-2401', 'LOG-2402', 'LOG-2398'].map(code => (
              <button
                key={code}
                type="button"
                onClick={() => setQuery(code)}
                className="text-xs font-mono text-[#009adb] border border-[#009adb]/30 bg-[#009adb]/5 hover:bg-[#009adb]/10 px-2.5 py-1 rounded-full transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </form>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="w-full max-w-2xl mt-8 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-lg p-8 animate-pulse">
            <div className="h-5 bg-surface-container rounded w-1/3 mb-3" />
            <div className="h-4 bg-surface-container rounded w-1/4 mb-8" />
            <div className="space-y-6 pl-8 relative">
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-surface-container" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-surface-container flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-1/3" />
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tracking timeline result ── */}
        {shipment && !loading && (
          <div className="w-full max-w-2xl mt-8 bg-surface-container-lowest/95 backdrop-blur-md shadow-lg rounded-xl border border-outline-variant/20 p-8 relative overflow-hidden animate-slide-up">

            {/* Subtle inner dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#041627 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* ── Header ── */}
            <div className="flex justify-between items-end mb-8 pb-4 border-b border-outline-variant/20 relative z-10">
              <div>
                <h2 className="text-xl font-semibold text-primary">Status Overview</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  ID: <span className="font-mono font-bold">{shipment.shipmentCode}</span>
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${badge.cls}`}>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {shipment.status === 'IN_TRANSIT' ? 'airport_shuttle'
                    : shipment.status === 'DELIVERED' ? 'task_alt'
                    : 'schedule'}
                </span>
                {badge.label}
              </span>
            </div>

            {/* ── Vertical milestone timeline ── */}
            <div className="relative pl-10 z-10">
              {/* Full grey rail */}
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-outline-variant/30" />
              {/* Cyan progress fill */}
              <div
                className="absolute left-[11px] top-3 w-[2px] bg-[#009adb] transition-all duration-700"
                style={{ height: `${Math.min((milestoneIdx / (MILESTONE_ORDER.length - 1)) * 100, 100)}%` }}
              />

              {MILESTONE_ORDER.map((milestone, idx) => {
                const completed = idx < milestoneIdx;
                const current   = idx === milestoneIdx;
                const pending   = idx > milestoneIdx;

                const matchingEvent = events.find(e => e.status === milestone);

                return (
                  <div
                    key={milestone}
                    className={`relative flex items-start mb-8 last:mb-0 group ${pending ? 'opacity-50' : ''}`}
                  >
                    {/* Node */}
                    <div
                      className={`absolute -left-10 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300
                        ${completed ? 'bg-[#009adb] shadow-sm'                                   : ''}
                        ${current   ? 'bg-[#009adb]'                                             : ''}
                        ${pending   ? 'border-2 border-outline-variant bg-surface-container-lowest' : ''}
                      `}
                      style={current ? { animation: 'pulse-ring 2s infinite cubic-bezier(0.66,0,0,1)' } : {}}
                    >
                      {completed && (
                        <span
                          className="material-symbols-outlined text-white text-sm"
                          style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}
                        >
                          check
                        </span>
                      )}
                      {current && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`font-semibold transition-colors group-hover:text-[#009adb]
                        ${current ? 'text-[#009adb] text-xl' : 'text-xl text-on-surface'}`}
                      >
                        {MILESTONE_LABELS[milestone]}
                      </h3>

                      {(completed || current) && matchingEvent && (
                        <>
                          <p className="text-sm text-on-surface-variant mt-1">{matchingEvent.description}</p>
                          <p className={`text-xs font-semibold tracking-wide mt-1 ${current ? 'text-[#009adb]' : 'text-outline'}`}>
                            {new Date(matchingEvent.timestamp).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </>
                      )}

                      {(completed || current) && !matchingEvent && milestone === 'PENDING' && (
                        <>
                          <p className="text-sm text-on-surface-variant mt-1">{shipment.origin}</p>
                          <p className="text-xs font-semibold tracking-wide mt-1 text-outline">
                            {new Date(shipment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      )}

                      {pending && <p className="text-xs font-semibold text-outline mt-1 tracking-wide">Pending</p>}

                      {/* Vessel detail card for active In Transit */}
                      {current && shipment.status === 'IN_TRANSIT' && (
                        <div className="mt-3 bg-surface-container-low rounded-lg p-3 border border-outline-variant/10 max-w-xs">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-secondary">sailing</span>
                            <div>
                              <p className="text-xs font-semibold text-secondary">
                                Route: {shipment.origin} → {shipment.destination}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                Est. Arrival:{' '}
                                {shipment.deliveryDate
                                  ? new Date(shipment.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  : 'TBD'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Summary footer ── */}
            <div className="mt-8 pt-5 border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {[
                { icon: 'flight_takeoff', label: 'Origin',      value: shipment.origin },
                { icon: 'flight_land',   label: 'Destination', value: shipment.destination },
                { icon: 'scale',         label: 'Weight',      value: `${shipment.weight} kg` },
                { icon: 'person',        label: 'Customer',    value: shipment.customerName },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-on-surface mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA: sign up to do more ── */}
        {!shipment && !loading && (
          <div className="mt-16 w-full max-w-2xl text-center">
            <p className="text-sm text-on-surface-variant">
              Want full shipment management?{' '}
              <Link to="/signup" className="text-[#009adb] font-bold hover:underline">
                Create a free account →
              </Link>
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-8 px-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container border-t border-outline-variant/20 z-20 relative">
        <div className="text-xl font-bold text-on-surface">LogiFlow</div>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Support', 'Documentation'].map(l => (
            <a key={l} href="#" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors tracking-wide">{l}</a>
          ))}
        </div>
        <p className="text-xs text-secondary">© 2024 LogiFlow Logistics Systems. All rights reserved.</p>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse-ring {
          100% { box-shadow: 0 0 0 15px rgba(0,154,219,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
