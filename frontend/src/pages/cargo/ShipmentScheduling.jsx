import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assignShipment, fetchSchedulingDashboard, fetchShipmentById } from '../../lib/cargoApi';
import PageFooter from '../../components/layout/PageFooter';

const VEHICLE_STATUS_STYLES = {
  Available: 'text-green-600 font-semibold',
  'In Use': 'text-amber-500 font-semibold',
  'Not Available': 'text-gray-400 font-semibold',
};

function AssignModal({ cargo, routes, vehicles, onClose, onAssigned }) {
  const [routeId, setRouteId] = useState(cargo.route?.id || '');
  const [vehicleId, setVehicleId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!routeId || !vehicleId) {
      setError('Please select both a route and a vehicle.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await assignShipment(cargo.id, { routeId, vehicleId, status: 'IN_TRANSIT' });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign shipment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="card w-full max-w-md p-6 shadow-xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Schedule {cargo.shipmentCode}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">
          {cargo.origin} → {cargo.destination} · {cargo.weight} kg
        </p>
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="input-label">Route</label>
            <select className="input-field text-sm" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
              <option value="">Select route</option>
              {routes.filter((r) => r.isActive).map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeId} — {route.startHub} → {route.endHub} ({route.estimatedDays}d)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Vehicle</label>
            <select className="input-field text-sm" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">Select vehicle</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleId} — {vehicle.type} ({vehicle.capacity.toLocaleString()} kg)
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No available vehicles. Check Route Management.</p>
            )}
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
            <button type="submit" disabled={saving} className="btn-accent text-sm py-2 px-4">
              {saving ? 'Assigning...' : 'Assign & Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShipmentScheduling() {
  const [unscheduledCargo, setUnscheduledCargo] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignTarget, setAssignTarget] = useState(null);
  const navigate = useNavigate();

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchSchedulingDashboard()
      .then((data) => {
        setUnscheduledCargo(data.unscheduledCargo || []);
        setVehicles(data.vehicles || []);
        setRoutes(data.routes || []);
        return data;
      })
      .catch((err) => setError(err.message || 'Failed to load scheduling data.'))
      .finally(() => setLoading(false));
  }, []);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newId = params.get('newId');

    loadDashboard().then((data) => {
      if (!newId) return;
      const found = (data?.unscheduledCargo || []).find((c) => String(c.id) === String(newId) || String(c.shipmentCode) === String(newId));
      if (found) {
        setAssignTarget(found);
        return;
      }
      // fallback: fetch the shipment by id and open assign modal
      fetchShipmentById(newId)
        .then((resp) => {
          const shipment = resp.shipment || resp;
          setAssignTarget(shipment);
        })
        .catch(() => {
          // ignore - scheduling list will show the cargo when available
        });
    });
  }, [loadDashboard, location.search]);

  return (
    <div className="max-w-[1200px] mx-auto min-h-full flex flex-col animate-slide-up">
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="page-title">Shipment Scheduling Dashboard</h1>
          <Link to="/cargo/new" className="btn-accent text-sm py-2 px-5 mt-4 inline-flex">Schedule New Shipment</Link>
        </div>

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card overflow-hidden shadow-card">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h2 className="text-headline-md font-semibold text-on-surface">Unscheduled Cargo List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead className="bg-secondary-container/60">
                  <tr>
                    <th>Shipment Code</th>
                    <th>Description</th>
                    <th>Destination</th>
                    <th>Weight (kg)</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">Loading cargo...</td></tr>
                  ) : unscheduledCargo.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">No unscheduled cargo found.</td></tr>
                  ) : unscheduledCargo.map((cargo) => (
                    <tr key={cargo.id}>
                      <td>
                        <Link to={`/track?code=${encodeURIComponent(cargo.shipmentCode)}`} className="font-semibold text-accent hover:underline">
                          {cargo.shipmentCode}
                        </Link>
                      </td>
                      <td>{cargo.description || 'No description'}</td>
                      <td className="text-on-surface-variant">{cargo.destination}</td>
                      <td className="text-on-surface-variant">{cargo.weight.toLocaleString()}</td>
                      <td>
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          {cargo.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => setAssignTarget(cargo)}
                          className="btn-accent text-xs py-1.5 px-3"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6 shadow-card">
            <h2 className="text-headline-md font-semibold text-on-surface mb-5">Fleet Status Overview</h2>
            <div className="space-y-5">
              {vehicles.length === 0 && !loading && (
                <p className="text-sm text-on-surface-variant">No vehicles registered.</p>
              )}
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-start gap-4 pb-5 border-b border-outline-variant last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-surface">local_shipping</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface">Vehicle {vehicle.vehicleId}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{vehicle.description || vehicle.type}</p>
                  </div>
                  <span className={`text-sm ${VEHICLE_STATUS_STYLES[vehicle.status] || 'text-gray-500'}`}>
                    {vehicle.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {assignTarget && (
        <AssignModal
          cargo={assignTarget}
          routes={routes}
          vehicles={vehicles}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => {
            // refresh dashboard then navigate to cargo list
            loadDashboard().finally(() => navigate('/cargo'));
          }}
        />
      )}

      <PageFooter />
    </div>
  );
}
