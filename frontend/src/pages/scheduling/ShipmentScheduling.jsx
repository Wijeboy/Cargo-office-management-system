import { MOCK_UNSCHEDULED_CARGO, MOCK_VEHICLES } from '../../data/mockData';
import PageFooter from '../../components/layout/PageFooter';

const PRIORITY_STYLES = {
  High: 'bg-red-100 text-red-700',
  Standard: 'bg-green-100 text-green-700',
};

const VEHICLE_STATUS_STYLES = {
  Available: 'text-green-600 font-semibold',
  'In Use': 'text-amber-500 font-semibold',
};

export default function ShipmentScheduling() {
  return (
    <div className="max-w-[1200px] mx-auto min-h-full flex flex-col animate-slide-up">
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="page-title">Shipment Scheduling Dashboard</h1>
          <button type="button" className="btn-accent text-sm py-2 px-5 mt-4">Schedule New Shipment</button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Unscheduled Cargo List */}
          <div className="xl:col-span-2 card overflow-hidden shadow-card">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h2 className="text-headline-md font-semibold text-on-surface">Unscheduled Cargo List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead className="bg-secondary-container/60">
                  <tr>
                    <th>Cargo ID</th>
                    <th>Description</th>
                    <th>Destination</th>
                    <th>Weight (kg)</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_UNSCHEDULED_CARGO.map(cargo => (
                    <tr key={cargo.id}>
                      <td>
                        <button type="button" className="font-semibold text-accent hover:underline">
                          {cargo.cargoId}
                        </button>
                      </td>
                      <td>{cargo.description}</td>
                      <td className="text-on-surface-variant">{cargo.destination}</td>
                      <td className="text-on-surface-variant">{cargo.weight.toLocaleString()}</td>
                      <td>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${PRIORITY_STYLES[cargo.priority]}`}>
                          {cargo.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fleet Status Overview */}
          <div className="card p-6 shadow-card">
            <h2 className="text-headline-md font-semibold text-on-surface mb-5">Fleet Status Overview</h2>
            <div className="space-y-5">
              {MOCK_VEHICLES.map(vehicle => (
                <div key={vehicle.id} className="flex items-start gap-4 pb-5 border-b border-outline-variant last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-surface">local_shipping</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface">Vehicle {vehicle.vehicleId}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{vehicle.description}</p>
                  </div>
                  <span className={`text-sm ${VEHICLE_STATUS_STYLES[vehicle.status]}`}>
                    {vehicle.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
