import { useState } from 'react';
import { MOCK_SHIPMENTS, MOCK_TRACKING_EVENTS } from '../../data/mockData';

const STATUS_COLORS = {
  PICKED_UP: 'bg-secondary-container text-on-secondary-container',
  PROCESSING: 'bg-primary-fixed text-on-primary-fixed',
  IN_TRANSIT: 'bg-secondary-container text-on-secondary-container',
  OUT_FOR_DELIVERY: 'bg-tertiary-fixed text-on-tertiary-fixed',
  DELIVERED: 'bg-[#d1fae5] text-[#065f46]',
  DELAYED: 'bg-error-container text-on-error-container',
};
const STATUS_ICONS = {
  PICKED_UP: 'inventory_2',
  PROCESSING: 'settings',
  IN_TRANSIT: 'local_shipping',
  OUT_FOR_DELIVERY: 'delivery_truck_speed',
  DELIVERED: 'task_alt',
  DELAYED: 'warning',
};

export default function TrackCargo() {
  const [query, setQuery] = useState('');
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setNotFound(false);
    setShipment(null);
    setEvents([]);

    await new Promise(r => setTimeout(r, 900));

    const found = MOCK_SHIPMENTS.find(
      s => s.shipmentCode.toLowerCase() === query.trim().toLowerCase() ||
           s.id === query.trim()
    );

    if (found) {
      setShipment(found);
      setEvents(MOCK_TRACKING_EVENTS[found.shipmentCode] || []);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const latestEvent = events[events.length - 1];

  const SHIP_STATUS = {
    IN_TRANSIT: { label: 'In Transit', class: 'badge-warning' },
    DELIVERED: { label: 'Delivered', class: 'badge-success' },
    DELAYED: { label: 'Delayed', class: 'badge-danger' },
    PENDING: { label: 'Pending', class: 'badge-neutral' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Track Cargo</h1>
        <p className="page-subtitle">Enter a shipment ID or tracking code to get real-time updates.</p>
      </div>

      {/* Search card */}
      <div className="card p-6">
        <form onSubmit={handleTrack} className="flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
            <input
              type="text"
              className="input-with-icon h-12 text-body-md"
              placeholder="e.g. LOG-2401"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-accent px-6 h-12">
            {loading ? (
              <span className="material-symbols-outlined animate-spin-slow">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">location_searching</span>
                Track
              </>
            )}
          </button>
        </form>

        {/* Quick tries */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-on-surface-variant">Try:</span>
          {['LOG-2401', 'LOG-2402', 'LOG-2398'].map(code => (
            <button
              key={code}
              onClick={() => setQuery(code)}
              className="text-xs font-mono text-accent border border-accent/30 px-2 py-0.5 rounded hover:bg-accent/5 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="card p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-surface-container rounded w-1/3" />
          <div className="h-4 bg-surface-container rounded w-2/3" />
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-surface-container rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                  <div className="h-3 bg-surface-container rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not found */}
      {notFound && !loading && (
        <div className="card p-10 text-center animate-slide-up">
          <span className="material-symbols-outlined material-symbols-filled text-6xl text-on-surface-variant">search_off</span>
          <h3 className="text-headline-md text-on-surface font-bold mt-4">Shipment Not Found</h3>
          <p className="text-on-surface-variant text-body-md mt-2">
            No shipment found for "<strong>{query}</strong>". Please verify the tracking code and try again.
          </p>
        </div>
      )}

      {/* Result */}
      {shipment && !loading && (
        <div className="space-y-6 animate-slide-up">
          {/* Shipment summary */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-label-md text-on-surface-variant font-mono">#{shipment.shipmentCode}</span>
                  <span className={`badge ${SHIP_STATUS[shipment.status]?.class || 'badge-neutral'}`}>
                    {SHIP_STATUS[shipment.status]?.label}
                  </span>
                </div>
                <h2 className="text-headline-md text-on-surface font-bold">{shipment.description}</h2>
                <p className="text-body-sm text-on-surface-variant mt-1">Customer: {shipment.customerName}</p>
              </div>
              {shipment.deliveryDate && (
                <div className="text-right">
                  <p className="text-label-md text-on-surface-variant">Est. Delivery</p>
                  <p className="text-headline-md text-on-surface font-bold">
                    {new Date(shipment.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: 'flight_takeoff', label: 'Origin', value: shipment.origin },
                { icon: 'flight_land', label: 'Destination', value: shipment.destination },
                { icon: 'scale', label: 'Weight', value: `${shipment.weight} kg` },
                { icon: 'schedule', label: 'Dispatched', value: shipment.dispatchDate ? new Date(shipment.dispatchDate).toLocaleDateString() : 'Not yet' },
              ].map(item => (
                <div key={item.label} className="bg-surface-container-low rounded-lg p-3">
                  <span className="material-symbols-outlined text-outline text-base">{item.icon}</span>
                  <p className="text-xs text-on-surface-variant mt-1">{item.label}</p>
                  <p className="text-sm font-semibold text-on-surface">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {events.length > 0 && (
            <div className="card p-6">
              <h3 className="text-body-lg font-semibold text-on-surface mb-6">Tracking Timeline</h3>
              <div className="space-y-0">
                {events.map((ev, i) => {
                  const isLast = i === events.length - 1;
                  const isFirst = i === 0;
                  return (
                    <div key={ev.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${isLast ? 'bg-primary text-on-primary shadow-accent-glow' : 'bg-surface-container text-on-surface-variant'}`}>
                          <span className={`material-symbols-outlined text-base ${isLast ? 'material-symbols-filled' : ''}`}>
                            {STATUS_ICONS[ev.status] || 'circle'}
                          </span>
                        </div>
                        {!isLast && <div className="w-0.5 h-12 bg-outline-variant mt-1" />}
                      </div>

                      {/* Content */}
                      <div className={`pb-8 flex-1 ${isLast ? 'pb-0' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-sm font-semibold ${isLast ? 'text-accent' : 'text-on-surface'}`}>
                              {ev.description}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              {ev.location}
                            </p>
                          </div>
                          <span className="text-xs text-on-surface-variant flex-shrink-0">
                            {new Date(ev.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`inline-flex mt-2 badge text-[10px] py-0.5 ${STATUS_COLORS[ev.status] || 'bg-surface-container text-on-surface-variant'}`}>
                          {ev.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
