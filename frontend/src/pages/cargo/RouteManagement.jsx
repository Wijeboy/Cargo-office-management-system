import { MOCK_VEHICLES, MOCK_ROUTES, MOCK_ROUTE_HUBS } from '../../data/mockData';
import PageFooter from '../../components/layout/PageFooter';

function RouteNetworkMap() {
  const connections = [
    { from: MOCK_ROUTE_HUBS[0], to: MOCK_ROUTE_HUBS[1] },
    { from: MOCK_ROUTE_HUBS[1], to: MOCK_ROUTE_HUBS[2] },
  ];

  return (
    <div className="relative w-full h-64 bg-surface-container-low rounded-lg overflow-hidden">
      <svg viewBox="0 0 560 240" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Map background */}
        <rect width="560" height="240" fill="#f0f2f5" />
        <path d="M0 180 Q140 160 280 140 T560 120" fill="none" stroke="#e2e5ea" strokeWidth="2" />
        <path d="M0 100 Q200 80 400 90 T560 70" fill="none" stroke="#e2e5ea" strokeWidth="1.5" />

        {/* Route lines */}
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="8 6"
          />
        ))}

        {/* Hub nodes */}
        {MOCK_ROUTE_HUBS.map(hub => (
          <g key={hub.id}>
            <circle cx={hub.x} cy={hub.y} r="14" fill={hub.color} stroke="#fff" strokeWidth="3" />
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
    </div>
  );
}

export default function RouteManagement() {
  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="page-title">Route &amp; Transport Management</h1>
        <div className="flex flex-wrap gap-3 mt-4">
          <button type="button" className="btn-accent text-sm py-2 px-5">Create New Route</button>
          <button type="button" className="btn-secondary text-sm py-2 px-5">Add Vehicle</button>
        </div>
      </div>

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
                {MOCK_VEHICLES.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>
                      <button type="button" className="font-semibold text-accent hover:underline">
                        {vehicle.vehicleId}
                      </button>
                    </td>
                    <td>{vehicle.type}</td>
                    <td className="text-on-surface-variant">{vehicle.capacity.toLocaleString()}</td>
                    <td>
                      <span className={`font-semibold ${vehicle.status === 'Available' ? 'text-green-600' : 'text-amber-500'}`}>
                        {vehicle.status}
                      </span>
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
                {MOCK_ROUTES.map(route => (
                  <tr key={route.id}>
                    <td>
                      <button type="button" className="font-semibold text-accent hover:underline">
                        {route.routeId}
                      </button>
                    </td>
                    <td>{route.startHub} → {route.endHub}</td>
                    <td className="text-on-surface-variant">{route.estimatedDays}</td>
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
