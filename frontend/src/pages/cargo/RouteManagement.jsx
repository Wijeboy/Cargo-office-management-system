import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRoute, createVehicle, fetchRoutes, fetchVehicles, updateRoute, updateVehicle } from '../../lib/cargoApi';
import PageFooter from '../../components/layout/PageFooter';

const ROUTE_HUBS = [
  { id: 'hub_001', name: 'Oakland Hub', x: 80, y: 180, color: '#f59e0b' },
  { id: 'hub_002', name: 'Chicago Hub', x: 280, y: 120, color: '#009adb' },
  { id: 'hub_003', name: 'JFK Airport', x: 480, y: 100, color: '#009adb' },
];

function RouteNetworkMap() {
  const connections = [
    { from: ROUTE_HUBS[0], to: ROUTE_HUBS[1] },
    { from: ROUTE_HUBS[1], to: ROUTE_HUBS[2] },
  ];

  const [hovered, setHovered] = useState(null);

  const svgW = 560;
  const svgH = 240;

  return (
    <div className="relative w-full h-64 bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0 L0 0 0 28" fill="none" stroke="#eef2f7" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Soft map background */}
        <rect width={svgW} height={svgH} fill="url(#grid)" />
        <rect x="0" y="0" width={svgW} height={svgH} fill="transparent" />

        {/* Decorative wave-lines */}
        <path d="M0 180 Q140 160 280 140 T560 120" fill="none" stroke="#e9eef3" strokeWidth="2" />
        <path d="M0 100 Q200 80 400 90 T560 70" fill="none" stroke="#f3f6f9" strokeWidth="1.5" />

        {/* Route lines with arrows */}
        {connections.map((conn, i) => {
          const midX = (conn.from.x + conn.to.x) / 2;
          const midY = (conn.from.y + conn.to.y) / 2 - 12;
          const pathD = `M ${conn.from.x} ${conn.from.y} Q ${midX} ${midY} ${conn.to.x} ${conn.to.y}`;
          return (
            <path key={i} d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#arrow)" />
          );
        })}

        {/* Hub nodes (interactive) */}
        {ROUTE_HUBS.map(hub => (
          <g key={hub.id} onMouseEnter={() => setHovered(hub)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
            <circle cx={hub.x} cy={hub.y} r="14" fill={hub.color} stroke="#fff" strokeWidth="3" />
            <circle cx={hub.x} cy={hub.y} r="20" fill="none" stroke={hub.color} opacity="0.06" />
            <text
              x={hub.x}
              y={hub.y + 32}
              textAnchor="middle"
              className="text-[11px] font-semibold fill-on-surface"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {hub.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none bg-on-surface text-on-primary rounded-md py-1 px-2 text-xs shadow-md"
          style={{
            left: `${(hovered.x / svgW) * 100}%`,
            top: `${(hovered.y / svgH) * 100}%`,
            transform: 'translate(-50%, -120%)',
            background: 'rgba(17,24,39,0.9)',
            color: '#fff',
          }}
        >
          <div className="font-semibold text-sm">{hovered.name}</div>
          <div className="text-xs text-slate-200">Hub ID: {hovered.id}</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute right-3 bottom-3 bg-surface/70 backdrop-blur-sm rounded-md px-3 py-2 text-xs shadow-sm border border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-xs">Legend</span>
            <div className="text-[11px] text-on-surface-variant">Hubs · Routes</div>
          </div>
          <div className="ml-2 flex items-center gap-2">
            {ROUTE_HUBS.map(h => (
              <div key={h.id} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
              </div>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <svg width="36" height="12"><path d="M2 8 Q18 2 34 8" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" fill="none" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const VEHICLE_STATUS_OPTIONS = ['Available', 'In Use', 'Not Available'];

function generateClientId(prefix) {
  const timestamp = Date.now().toString(36).slice(-6).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${randomPart}`;
}

function VehicleStatusBadge({ status }) {
  const statusClasses = {
    Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'In Use': 'bg-amber-50 text-amber-700 ring-amber-200',
    'Not Available': 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses[status] || 'bg-surface-container-low text-on-surface-variant ring-outline-variant'}`}>
      {status}
    </span>
  );
}

export default function RouteManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);
  const [routeSubmitting, setRouteSubmitting] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [routeError, setRouteError] = useState('');
  const [vehicleForm, setVehicleForm] = useState({
    vehicleId: '',
    registrationNumber: '',
    type: '',
    capacity: '',
    status: 'Available',
    description: '',
  });
  const [routeForm, setRouteForm] = useState({
    routeId: '',
    startHub: '',
    endHub: '',
    estimatedDays: '',
    isActive: true,
  });
  const [statusSavingId, setStatusSavingId] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([fetchVehicles(), fetchRoutes()])
      .then(([vehiclesData, routesData]) => {
        if (!active) return;
        setVehicles(vehiclesData.vehicles || []);
        setRoutes(routesData.routes || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openVehicleForm = () => {
    const generatedVehicleId = generateClientId('VEH');
    setVehicleError('');
    setVehicleForm(prev => ({
      ...prev,
      vehicleId: generatedVehicleId,
      registrationNumber: '',
    }));
    setVehicleFormOpen(true);
  };

  const openRouteForm = () => {
    const generatedRouteId = generateClientId('RTE');
    setRouteError('');
    setRouteForm({
      routeId: generatedRouteId,
      startHub: '',
      endHub: '',
      estimatedDays: '',
      isActive: true,
    });
    setRouteFormOpen(true);
  };

  const closeVehicleForm = () => {
    setVehicleFormOpen(false);
    setVehicleError('');
    setVehicleForm({
      vehicleId: '',
      registrationNumber: '',
      type: '',
      capacity: '',
      status: 'Available',
      description: '',
    });
  };

  const closeRouteForm = () => {
    setRouteFormOpen(false);
    setRouteError('');
    setRouteForm({
      routeId: '',
      startHub: '',
      endHub: '',
      estimatedDays: '',
      isActive: true,
    });
  };

  const updateVehicleForm = (field) => (event) => {
    setVehicleForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const updateRouteForm = (field) => (event) => {
    const value = field === 'isActive' ? event.target.value === 'true' : event.target.value;
    setRouteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVehicle = async (event) => {
    event.preventDefault();
    setVehicleError('');
    setVehicleSubmitting(true);

    try {
      const response = await createVehicle({
        vehicleId: vehicleForm.vehicleId.trim(),
        registrationNumber: vehicleForm.registrationNumber.trim() || undefined,
        type: vehicleForm.type.trim(),
        capacity: Number(vehicleForm.capacity),
        status: vehicleForm.status,
        description: vehicleForm.description.trim() || undefined,
      });

      setVehicles(prev => [response.vehicle, ...prev]);
      setVehicleSubmitting(false);
      closeVehicleForm();
    } catch (error) {
      setVehicleError(error.message || 'Failed to create vehicle.');
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const handleAddRoute = async (event) => {
    event.preventDefault();
    setRouteError('');
    setRouteSubmitting(true);

    try {
      const response = await createRoute({
        routeId: routeForm.routeId.trim(),
        startHub: routeForm.startHub.trim(),
        endHub: routeForm.endHub.trim(),
        estimatedDays: Number(routeForm.estimatedDays),
        isActive: routeForm.isActive,
      });

      setRoutes(prev => [response.route, ...prev]);
      closeRouteForm();
    } catch (error) {
      setRouteError(error.message || 'Failed to create route.');
    } finally {
      setRouteSubmitting(false);
    }
  };

  const handleStatusChange = async (vehicle, nextStatus) => {
    if (vehicle.status === nextStatus) return;

    setStatusSavingId(vehicle.id);
    setVehicleError('');

    setVehicles(prev => prev.map(item => (item.id === vehicle.id ? { ...item, status: nextStatus } : item)));

    try {
      const response = await updateVehicle(vehicle.id, { status: nextStatus });
      setVehicles(prev => prev.map(item => (item.id === vehicle.id ? response.vehicle : item)));
    } catch (error) {
      setVehicles(prev => prev.map(item => (item.id === vehicle.id ? vehicle : item)));
      setVehicleError(error.message || 'Failed to update vehicle status.');
    } finally {
      setStatusSavingId(null);
    }
  };

  const handleRouteToggle = async (route, nextIsActive) => {
    setRouteError('');
    setRoutes(prev => prev.map(item => (item.id === route.id ? { ...item, isActive: nextIsActive } : item)));

    try {
      const response = await updateRoute(route.id, { isActive: nextIsActive });
      setRoutes(prev => prev.map(item => (item.id === route.id ? response.route : item)));
    } catch (error) {
      setRoutes(prev => prev.map(item => (item.id === route.id ? route : item)));
      setRouteError(error.message || 'Failed to update route.');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="page-title">Route &amp; Transport Management</h1>
        <div className="flex flex-wrap gap-3 mt-4">
          <button type="button" className="btn-accent text-sm py-2 px-5" onClick={openRouteForm}>Create New Route</button>
          <button type="button" className="btn-accent text-sm py-2 px-5" onClick={openVehicleForm}>Add Vehicle</button>
        </div>
      </div>

      {routeFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-surface shadow-card border border-outline-variant overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <div>
                <h2 className="text-headline-md font-semibold text-on-surface">Create New Route</h2>
                <p className="text-sm text-on-surface-variant mt-1">Route ID is generated automatically before save.</p>
              </div>
              <button type="button" className="text-on-surface-variant hover:text-on-surface" onClick={closeRouteForm} disabled={routeSubmitting}>
                Close
              </button>
            </div>
            <form onSubmit={handleAddRoute} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 md:col-span-2">
                  <span className="block text-sm font-medium text-on-surface">Route ID</span>
                  <input className="input-field bg-surface-container-low text-accent font-semibold" value={routeForm.routeId} readOnly />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Start Hub</span>
                  <input placeholder="e.g. Port of Oakland" className="input-field bg-surface-container-low" value={routeForm.startHub} onChange={updateRouteForm('startHub')} required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">End Hub</span>
                  <input placeholder="e.g. JFK Airport" className="input-field bg-surface-container-low" value={routeForm.endHub} onChange={updateRouteForm('endHub')} required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Estimated Days</span>
                  <input placeholder="e.g. 3.5" type="number" step="0.1" min="0" className="input-field bg-surface-container-low" value={routeForm.estimatedDays} onChange={updateRouteForm('estimatedDays')} required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Status</span>
                  <select className="input-field bg-surface-container-low" value={String(routeForm.isActive)} onChange={updateRouteForm('isActive')}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>
              </div>
              {routeError ? <p className="text-sm text-red-600">{routeError}</p> : null}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary text-sm py-2 px-5" onClick={closeRouteForm} disabled={routeSubmitting}>Cancel</button>
                <button type="submit" className="btn-accent text-sm py-2 px-5 disabled:opacity-60" disabled={routeSubmitting}>
                  {routeSubmitting ? 'Saving...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vehicleFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-surface shadow-card border border-outline-variant overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <div>
                <h2 className="text-headline-md font-semibold text-on-surface">Add Vehicle</h2>
                <p className="text-sm text-on-surface-variant mt-1">Vehicle ID is generated automatically before save.</p>
              </div>
              <button type="button" className="text-on-surface-variant hover:text-on-surface" onClick={closeVehicleForm} disabled={vehicleSubmitting}>
                Close
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 md:col-span-2">
                  <span className="block text-sm font-medium text-on-surface">Vehicle ID</span>
                  <input className="input-field bg-surface-container-low text-accent font-semibold" value={vehicleForm.vehicleId} readOnly />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Type</span>
                  <input placeholder="e.g. 20ft Truck, 40ft Trailer" className="input-field bg-surface-container-low" value={vehicleForm.type} onChange={updateVehicleForm('type')} required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Registration Number</span>
                  <input placeholder="e.g. ABC-1234" className="input-field bg-surface-container-low" value={vehicleForm.registrationNumber} onChange={updateVehicleForm('registrationNumber')} required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Capacity (kg)</span>
                  <input placeholder="e.g. 2500" type="number" min="0" className="input-field bg-surface-container-low" value={vehicleForm.capacity} onChange={updateVehicleForm('capacity')} required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-on-surface">Status</span>
                  <select className="input-field bg-surface-container-low" value={vehicleForm.status} onChange={updateVehicleForm('status')}>
                    {VEHICLE_STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="space-y-2 block">
                <span className="block text-sm font-medium text-on-surface">Description</span>
                <textarea placeholder="Optional: vehicle notes, dimensions, trailer type" className="input-field bg-surface-container-low min-h-[96px] resize-none" value={vehicleForm.description} onChange={updateVehicleForm('description')} />
              </label>
              {vehicleError ? <p className="text-sm text-red-600">{vehicleError}</p> : null}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary text-sm py-2 px-5" onClick={closeVehicleForm} disabled={vehicleSubmitting}>Cancel</button>
                <button type="submit" className="btn-accent text-sm py-2 px-5 disabled:opacity-60" disabled={vehicleSubmitting}>
                  {vehicleSubmitting ? 'Saving...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Route Network Map */}
      <div className="card p-6 shadow-card mb-6">
        <h2 className="text-headline-md font-semibold text-on-surface mb-4">Global Route Network Map</h2>
        <RouteNetworkMap />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Fleet Status */}
        <div className="card overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="text-headline-md font-semibold text-on-surface">Vehicle Fleet Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead className="bg-secondary-container/60">
                <tr>
                  <th>Vehicle ID</th>
                  <th>Type</th>
                  <th>Capacity (kg)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">Loading vehicles...</td></tr>
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No vehicles found.</td></tr>
                ) : vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>
                      <span className="font-semibold text-accent">{vehicle.vehicleId}</span>
                    </td>
                    <td>{vehicle.type}</td>
                    <td className="text-on-surface-variant">{vehicle.capacity.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <select
                          className="input-field bg-surface-container-low min-w-[150px]"
                          value={vehicle.status}
                          onChange={(event) => handleStatusChange(vehicle, event.target.value)}
                          disabled={statusSavingId === vehicle.id}
                        >
                          {VEHICLE_STATUS_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <VehicleStatusBadge status={vehicle.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Operational Routes */}
        <div className="card overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="text-headline-md font-semibold text-on-surface">Active Operational Routes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead className="bg-secondary-container/60">
                <tr>
                  <th>Route ID</th>
                  <th>Start-End Hubs</th>
                  <th>Est. Time (days)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">Loading routes...</td></tr>
                ) : routes.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">No routes found.</td></tr>
                ) : routes.map(route => (
                  <tr key={route.id}>
                    <td>
                      <button type="button" className="font-semibold text-accent hover:underline">
                        {route.routeId}
                      </button>
                    </td>
                    <td>{route.startHub} → {route.endHub}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-on-surface-variant">{route.estimatedDays}</span>
                        <button
                          type="button"
                          className={`text-xs font-semibold rounded-full px-3 py-1 ring-1 ${route.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}
                          onClick={() => handleRouteToggle(route, !route.isActive)}
                        >
                          {route.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
