import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_SHIPMENTS, MOCK_TRACKING_EVENTS } from '../../data/mockData';

/* ── Milestone steps ───────────────────────────────────── */
const MILESTONE_ORDER = ['PENDING', 'PICKED_UP', 'PROCESSING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const MILESTONE_LABELS = {
  PENDING: 'Booked',
  PICKED_UP: 'Picked Up',
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};
const MILESTONE_ICONS = {
  PENDING: 'inventory_2',
  PICKED_UP: 'storefront',
  PROCESSING: 'settings',
  IN_TRANSIT: 'local_shipping',
  OUT_FOR_DELIVERY: 'delivery_truck_speed',
  DELIVERED: 'task_alt',
};

const SHIP_STATUS_BADGE = {
  IN_TRANSIT: { label: 'In Transit', class: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  DELIVERED: { label: 'Delivered', class: 'bg-[#d1fae5] text-[#065f46]' },
  DELAYED: { label: 'Delayed', class: 'bg-error-container text-on-error-container' },
  PENDING: { label: 'Booked', class: 'bg-secondary-container text-on-secondary-container' },
  CANCELLED: { label: 'Cancelled', class: 'bg-error-container text-on-error-container' },
};

function getMilestoneIndex(events) {
  if (!events || events.length === 0) return 0;
  const lastStatus = events[events.length - 1].status;
  const idx = MILESTONE_ORDER.indexOf(lastStatus);
  return idx === -1 ? 1 : idx;
}

export default function TrackCargo() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
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
      navigate('/not-found', { state: { trackingCode: code } });
    }
    setLoading(false);
  };

  const milestoneIdx = getMilestoneIndex(events);
  const lastEvent = events[events.length - 1];
  const badge = SHIP_STATUS_BADGE[shipment?.status] || SHIP_STATUS_BADGE.PENDING;

  return (
    <div className="min-h-full flex flex-col items-center relative animate-fade-in">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'radial-gradient(#c4c6cd 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: '-12px -12px' }}
      />

      <div className="relative z-10 w-full max-w-3xl pt-4">

        {/* ── Header + Search ── */}
        <div className="text-center mb-8">
          <h1 className="text-headline-xl text-primary font-bold tracking-tight">Track Your Shipment</h1>
          <p className="text-body-lg text-on-surface-variant mt-2 mb-8">
            Enter your tracking ID to monitor your cargo in real-time.
          </p>

          <form onSubmit={handleTrack}>
            <div
              className="relative w-full flex items-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-2 shadow-lg transition-all duration-300"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
            >
              <span className="material-symbols-outlined text-outline ml-3 mr-2 flex-shrink-0">search</span>
              <input
                className="flex-grow bg-transparent border-none focus:ring-0 text-body-lg text-primary placeholder:text-outline-variant py-2 outline-none font-medium"
                placeholder="e.g. LOG-2401"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-accent px-7 py-2.5 text-sm flex-shrink-0 transition-all duration-200"
              >
                {loading
                  ? <span className="material-symbols-outlined animate-spin-slow">progress_activity</span>
                  : 'Track'}
              </button>
            </div>
          </form>

          {/* Quick try chips */}
          <div className="mt-3 flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs text-on-surface-variant">Try:</span>
            {['LOG-2401', 'LOG-2402', 'LOG-2398'].map(code => (
              <button
                key={code}
                onClick={() => setQuery(code)}
                className="text-xs font-mono text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10 px-2.5 py-1 rounded-full transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>



        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="card p-8 space-y-5 animate-pulse mb-8">
            <div className="h-5 bg-surface-container rounded w-1/3" />
            <div className="h-4 bg-surface-container rounded w-1/4" />
            <div className="space-y-6 mt-4 pl-8 relative">
              <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-surface-container" />
              {[1, 2, 3].map(i => (
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

        {/* ── Results: Timeline card ── */}
        {shipment && !loading && (
          <div className="card p-8 shadow-lg animate-slide-up mb-8 relative overflow-hidden">
            {/* Subtle background pattern inside card */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#041627 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* ── Status Overview header ── */}
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-outline-variant/20 relative z-10">
              <div>
                <h2 className="text-headline-md text-primary font-semibold">Status Overview</h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  ID: <span className="font-mono font-bold">{shipment.shipmentCode}</span> &bull; {shipment.description}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md ${badge.class}`}>
                <span className="material-symbols-outlined text-sm material-symbols-filled">
                  {shipment.status === 'IN_TRANSIT' ? 'airport_shuttle' : shipment.status === 'DELIVERED' ? 'task_alt' : 'schedule'}
                </span>
                {badge.label}
              </span>
            </div>

            {/* ── Vertical milestone timeline ── */}
            <div className="relative pl-10 z-10">
              {/* Full background line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-outline-variant/30" />
              {/* Progress fill line */}
              <div
                className="absolute left-[11px] top-3 w-[2px] bg-accent transition-all duration-700"
                style={{ height: `${Math.min((milestoneIdx / (MILESTONE_ORDER.length - 1)) * 100, 100)}%` }}
              />

              {MILESTONE_ORDER.map((milestone, idx) => {
                const completed = idx < milestoneIdx;
                const current = idx === milestoneIdx;
                const pending = idx > milestoneIdx;

                // Find the matching event
                const matchingEvent = events.find(e => e.status === milestone) ||
                  (milestone === 'PENDING' && events.length === 0 ? null : null);

                return (
                  <div key={milestone} className={`relative flex items-start mb-8 last:mb-0 group ${pending ? 'opacity-50' : ''}`}>
                    {/* Node */}
                    <div className={`absolute -left-10 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300
                      ${completed ? 'bg-accent shadow-sm' : ''}
                      ${current ? 'bg-accent shadow-[0_0_0_0_rgba(0,154,219,0.7)]' : ''}
                      ${pending ? 'border-2 border-outline-variant bg-surface-container-lowest' : ''}
                    `}
                    style={current ? { animation: 'pulse-ring 2s infinite cubic-bezier(0.66, 0, 0, 1)' } : {}}>
                      {completed && (
                        <span className="material-symbols-outlined text-white text-sm material-symbols-filled">check</span>
                      )}
                      {current && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold transition-colors ${current ? 'text-accent text-headline-md' : 'text-headline-md text-on-surface'} group-hover:text-accent`}>
                        {MILESTONE_LABELS[milestone]}
                      </h3>

                      {(completed || current) && matchingEvent && (
                        <>
                          <p className="text-body-sm text-on-surface-variant mt-1">
                            {matchingEvent.description}
                          </p>
                          <p className={`text-label-md mt-1 ${current ? 'text-accent' : 'text-outline'}`}>
                            {new Date(matchingEvent.timestamp).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </>
                      )}

                      {(completed || current) && !matchingEvent && milestone === 'PENDING' && (
                        <>
                          <p className="text-body-sm text-on-surface-variant mt-1">
                            {shipment.origin}
                          </p>
                          <p className="text-label-md text-outline mt-1">
                            {new Date(shipment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      )}

                      {pending && (
                        <p className="text-label-md text-outline mt-1">Pending</p>
                      )}

                      {/* Current milestone: vessel detail card */}
                      {current && shipment.status === 'IN_TRANSIT' && (
                        <div className="mt-3 bg-surface-container-low rounded-lg p-3 border border-outline-variant/10 max-w-xs">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-secondary">sailing</span>
                            <div>
                              <p className="text-label-md text-secondary font-semibold">
                                Route: {shipment.origin} → {shipment.destination}
                              </p>
                              <p className="text-body-sm text-on-surface-variant">
                                Est. Arrival: {shipment.deliveryDate
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

            {/* Summary footer */}
            <div className="mt-8 pt-5 border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {[
                { icon: 'flight_takeoff', label: 'Origin', value: shipment.origin },
                { icon: 'flight_land', label: 'Destination', value: shipment.destination },
                { icon: 'scale', label: 'Weight', value: `${shipment.weight} kg` },
                { icon: 'person', label: 'Customer', value: shipment.customerName },
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
      </div>

      {/* pulse-ring keyframes injected inline */}
      <style>{`
        @keyframes pulse-ring {
          100% { box-shadow: 0 0 0 15px rgba(0, 154, 219, 0); }
        }
        .input-glow-focus:focus-within {
          box-shadow: 0 0 8px rgba(0, 154, 219, 0.3);
          border-color: #009adb;
        }
      `}</style>
    </div>
  );
}
