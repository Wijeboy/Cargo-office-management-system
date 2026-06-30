import { useState } from 'react';
import { MOCK_SHIPMENTS } from '../../data/mockData';
import { Link } from 'react-router-dom';

const STATUS_MAP = {
  IN_TRANSIT: { label: 'In Transit', class: 'badge-warning', dot: 'bg-secondary status-pulse' },
  DELIVERED: { label: 'Delivered', class: 'badge-success', dot: 'bg-[#10b981]' },
  DELAYED: { label: 'Delayed', class: 'badge-danger', dot: 'bg-error' },
  PENDING: { label: 'Pending', class: 'badge-neutral', dot: 'bg-outline' },
  CANCELLED: { label: 'Cancelled', class: 'badge-danger', dot: 'bg-error' },
};

const ALL_STATUSES = ['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'];

export default function CargoList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');

  const filtered = MOCK_SHIPMENTS
    .filter(s =>
      (statusFilter === 'ALL' || s.status === statusFilter) &&
      (s.shipmentCode.toLowerCase().includes(search.toLowerCase()) ||
       s.customerName.toLowerCase().includes(search.toLowerCase()) ||
       s.destination.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'weight') return b.weight - a.weight;
      return 0;
    });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Manage all cargo bookings and deliveries.</p>
        </div>
        <button className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add</span>
          New Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm" placeholder="Search by ID, customer, destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-10 text-sm w-full sm:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : STATUS_MAP[s]?.label || s}</option>)}
        </select>
        <select className="input-field h-10 text-sm w-full sm:w-40" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Newest</option>
          <option value="weight">Sort: Weight</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-body-sm text-on-surface-variant">{filtered.length} shipment{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment Code</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
                    No shipments match your filters.
                  </td>
                </tr>
              ) : filtered.map(s => {
                const st = STATUS_MAP[s.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="font-mono font-bold text-accent">#{s.shipmentCode}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-[9px] font-bold text-on-primary-fixed flex-shrink-0">
                          {s.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium">{s.customerName}</span>
                      </div>
                    </td>
                    <td className="text-on-surface-variant">
                      <span className="flex items-center gap-1 text-xs">
                        {s.origin}
                        <span className="material-symbols-outlined text-xs text-outline">arrow_forward</span>
                        {s.destination}
                      </span>
                    </td>
                    <td className="text-on-surface-variant">{s.weight} kg</td>
                    <td>
                      <span className={`badge ${st.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="text-on-surface-variant text-xs">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/track`} className="btn-ghost p-1.5" title="Track">
                          <span className="material-symbols-outlined text-base">location_on</span>
                        </Link>
                        <button className="btn-ghost p-1.5" title="Edit">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button className="btn-ghost p-1.5 hover:bg-error-container hover:text-on-error-container" title="Delete">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">Showing {filtered.length} results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-semibold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">Prev</button>
            <button className="px-3 py-1 text-xs font-semibold bg-primary text-on-primary rounded-lg">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
