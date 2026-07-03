import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SHIPMENTS, MOCK_TRACKING_EVENTS, MOCK_CARGO_TRACKING } from '../../data/mockData';
import PageFooter from '../../components/layout/PageFooter';

function TimelineStep({ step, isLast }) {
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';
  const isPending = step.status === 'pending';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10
            ${isCompleted ? 'bg-green-500' : ''}
            ${isCurrent ? 'bg-amber-400' : ''}
            ${isPending ? 'border-2 border-outline-variant bg-white' : ''}
          `}
        >
          {isCompleted && (
            <span className="material-symbols-outlined text-white text-sm material-symbols-filled">check</span>
          )}
          {isCurrent && (
            <span className="material-symbols-outlined text-white text-sm">add</span>
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[40px] ${isCompleted ? 'bg-green-500' : 'bg-outline-variant/40'}`} />
        )}
      </div>
      <div className={`pb-8 ${isPending ? 'opacity-50' : ''}`}>
        <p className={`font-semibold text-sm ${isCurrent ? 'text-on-surface' : isPending ? 'text-on-surface-variant' : 'text-on-surface'}`}>
          {step.label}
        </p>
        {step.date && (
          <p className="text-xs text-on-surface-variant mt-0.5">{step.date}</p>
        )}
      </div>
    </div>
  );
}

export default function TrackCargo() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('LOGI-98402');
  const [tracking, setTracking] = useState(MOCK_CARGO_TRACKING['LOGI-98402']);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    const code = query.trim();
    if (!code) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const detailed = MOCK_CARGO_TRACKING[code.toUpperCase()];
    if (detailed) {
      setTracking(detailed);
    } else {
      const found = MOCK_SHIPMENTS.find(
        s => s.shipmentCode.toLowerCase() === code.toLowerCase()
      );
      if (found) {
        const events = MOCK_TRACKING_EVENTS[found.shipmentCode] || [];
        setTracking({
          shipmentName: `${found.description} (${new Date(found.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          currentLocation: events.length > 0 ? events[events.length - 1].location : found.origin,
          sender: found.customerName,
          consignee: found.customerName,
          destination: found.destination,
          timeline: events.length > 0
            ? events.map((ev, i) => ({
                id: i,
                label: ev.description,
                date: new Date(ev.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                status: i < events.length - 1 ? 'completed' : 'current',
              }))
            : [
                { id: 0, label: 'Booking confirmed', date: new Date(found.createdAt).toLocaleString(), status: 'current' },
                { id: 1, label: 'Awaiting pickup', date: null, status: 'pending' },
              ],
        });
      } else {
        navigate('/not-found', { state: { trackingCode: code } });
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <h1 className="page-title mb-6">Cargo Tracking</h1>

      {/* Search Card */}
      <div className="card p-6 shadow-card mb-6">
        <form onSubmit={handleTrack}>
          <label className="input-label">Enter Tracking Number (e.g., LOGI-98402)</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <input
              className="input-field flex-1"
              placeholder="LOGI-98402"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-accent text-sm py-2.5 px-8 sm:w-auto w-full">
              {loading ? (
                <span className="material-symbols-outlined animate-spin-slow">progress_activity</span>
              ) : 'Track'}
            </button>
          </div>
        </form>
      </div>

      {/* Tracking Results */}
      {tracking && !loading && (
        <div className="card p-6 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Shipment Status */}
            <div>
              <h2 className="text-headline-md font-semibold text-on-surface mb-4">Current Shipment Status</h2>
              <p className="text-accent font-semibold">{tracking.shipmentName}</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Current Location: <span className="font-medium text-on-surface">{tracking.currentLocation}</span>
              </p>

              <div className="mt-6">
                {tracking.timeline.map((step, i) => (
                  <TimelineStep
                    key={step.id}
                    step={step}
                    isLast={i === tracking.timeline.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Cargo Details */}
            <div>
              <h2 className="text-headline-md font-semibold text-on-surface mb-5">Cargo Details</h2>
              <div className="space-y-5">
                {[
                  { label: 'Sender', value: tracking.sender },
                  { label: 'Consignee', value: tracking.consignee },
                  { label: 'Destination', value: tracking.destination },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-semibold text-on-surface mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}
