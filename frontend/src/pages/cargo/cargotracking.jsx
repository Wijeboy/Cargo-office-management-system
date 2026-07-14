import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addTrackingEvent, fetchTracking } from '../../lib/cargoApi';
import PageFooter from '../../components/layout/PageFooter';

const TRACKING_STATUSES = [
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'DELAYED', label: 'Delayed' },
];

export default function TrackCargo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('code') || 'LOG-2401');
  const [shipment, setShipment] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ location: '', status: 'IN_TRANSIT', description: '' });
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState('');

  const loadTracking = useCallback((code) => {
    if (!code) return;
    setLoading(true);
    setError('');
    return fetchTracking(code)
      .then((data) => {
        setShipment(data.shipment || null);
        setTracking(data.tracking || null);
      })
      .catch((err) => {
        setShipment(null);
        setTracking(null);
        setError(err.message || 'Shipment not found.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    setSearchParams({ code: query.trim() });
  };

  useEffect(() => {
    const code = searchParams.get('code') || query.trim();
    if (code) loadTracking(code);
  }, [searchParams, query, loadTracking]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!shipment?.id) return;
    setEventSaving(true);
    setEventError('');
    try {
      await addTrackingEvent(shipment.id, eventForm);
      setEventForm({ location: '', status: 'IN_TRANSIT', description: '' });
      setShowEventForm(false);
      await loadTracking(shipment.shipmentCode);
    } catch (err) {
      setEventError(err.message || 'Failed to add tracking event.');
    } finally {
      setEventSaving(false);
    }
  };

  const timeline = tracking?.timeline || [];
  const currentLocation = tracking?.currentLocation || shipment?.destination || 'Unknown';
  const latestStatus = shipment?.status || 'PENDING';
  const statusLabel = latestStatus.replaceAll('_', ' ');
  const statusBadgeClass = latestStatus === 'DELIVERED'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    : latestStatus === 'IN_TRANSIT'
      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
      : latestStatus === 'DELAYED'
        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
  const statusSteps = ['Booked', 'Picked Up', 'Processing', 'In Transit', 'Out for Delivery', 'Delivered'];
  const statusProgress = latestStatus === 'DELIVERED'
    ? 100
    : latestStatus === 'OUT_FOR_DELIVERY'
      ? 84
      : latestStatus === 'IN_TRANSIT'
        ? 66
        : latestStatus === 'PROCESSING'
          ? 42
          : latestStatus === 'PICKED_UP'
            ? 22
            : 8;

  return (
    <div className="min-h-screen bg-surface pb-12 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1f36]">Cargo Tracking</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <form onSubmit={handleTrack}>
          <label className="block text-sm text-gray-500 mb-2">Enter Tracking Number (e.g., LOG-2401)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="LOG-2401"
            />
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors sm:w-auto w-full"
            >
              Track
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <p className="text-sm text-gray-500">Loading shipment tracking...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-sm text-red-600">{error}</div>
      )}

      {shipment && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Current Shipment Status</p>
                <button
                  type="button"
                  onClick={() => setShowEventForm((v) => !v)}
                  className="text-sm font-medium text-[#2563eb] hover:underline"
                >
                  {showEventForm ? 'Cancel' : '+ Add Tracking Event'}
                </button>
              </div>
              <h2 className="text-2xl font-bold text-[#2563eb] mb-4">{tracking?.shipmentName || shipment.shippingMethod || 'Cargo Shipment'}</h2>

              {showEventForm && (
                <form onSubmit={handleAddEvent} className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-900">New Milestone</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Location</label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        value={eventForm.location}
                        onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="Chicago Hub"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Status</label>
                      <select
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        value={eventForm.status}
                        onChange={(e) => setEventForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        {TRACKING_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={eventForm.description}
                      onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Departed sorting facility"
                      required
                    />
                  </div>
                  {eventError && <p className="text-sm text-red-600">{eventError}</p>}
                  <button
                    type="submit"
                    disabled={eventSaving}
                    className="px-4 py-2 bg-[#2563eb] text-white text-sm font-medium rounded-lg disabled:opacity-60"
                  >
                    {eventSaving ? 'Saving...' : 'Save Event'}
                  </button>
                </form>
              )}

              <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 to-white p-4 mb-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Status</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                      <span className="text-sm text-gray-600">
                        Current Location: <span className="font-semibold text-gray-900">{currentLocation}</span>
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2 border border-gray-200">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Tracking Code</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{shipment.shipmentCode}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Shipment Progress</p>
                    <p className="text-xs font-semibold text-gray-600">{statusProgress}% complete</p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#10b981] transition-all duration-500"
                      style={{ width: `${statusProgress}%` }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {statusSteps.map((step, index) => {
                      const filled = index * 20 <= statusProgress;
                      return (
                        <div key={step} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${filled ? 'bg-[#10b981]' : 'bg-gray-300'}`} />
                          <span className={`text-xs font-medium ${filled ? 'text-gray-900' : 'text-gray-500'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {timeline.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-4">Tracking Timeline</p>
                  <div className="space-y-4 relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {timeline.map((event) => (
                      <div key={event.id || `${event.status}-${event.date}`} className="relative">
                        <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[#2563eb] ring-2 ring-white" />
                        <p className="text-sm font-semibold text-gray-900">{event.label || event.status?.replaceAll('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{event.location}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(event.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="border border-gray-200 rounded-xl p-6 min-h-[400px] bg-gradient-to-b from-white to-gray-50 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Cargo Details</p>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">Shipment Summary</h3>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${latestStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : latestStatus === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {latestStatus.replaceAll('_', ' ')}
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      {[
                        ['Shipment Code', shipment.shipmentCode],
                        ['Sender', shipment.senderName],
                        ['Consignee', shipment.consigneeName],
                        ['Route', `${shipment.origin || 'Origin'} → ${shipment.destination || 'Destination'}`],
                        ['Current Location', currentLocation],
                        ['Status', latestStatus.replaceAll('_', ' ')],
                        ['Shipping Method', shipment.shippingMethod || 'Standard'],
                        ['Weight', shipment.weight ? `${shipment.weight} kg` : '—'],
                        ['Expected Delivery', shipment.expectedDeliveryDate ? new Date(shipment.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'],
                      ].map(([label, value]) => (
                        <tr key={label} className="bg-white odd:bg-gray-50/80">
                          <th className="w-44 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 align-top">{label}</th>
                          <td className="px-4 py-3 text-gray-900 font-medium">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}
