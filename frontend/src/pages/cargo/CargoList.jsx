import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteShipment, fetchShipments, updateShipment } from '../../lib/cargoApi';

const STATUS_MAP = {
  IN_TRANSIT: { label: 'In Transit', class: 'badge-warning', dot: 'bg-secondary status-pulse' },
  DELIVERED: { label: 'Delivered', class: 'badge-success', dot: 'bg-[#10b981]' },
  DELAYED: { label: 'Delayed', class: 'badge-danger', dot: 'bg-error' },
  PENDING: { label: 'Pending', class: 'badge-neutral', dot: 'bg-outline' },
  CANCELLED: { label: 'Cancelled', class: 'badge-danger', dot: 'bg-error' },
};

const ALL_STATUSES = ['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'];
const EDIT_STATUSES = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'];
const PAGE_SIZE = 10;

function EditShipmentModal({ shipment, onClose, onSaved }) {
  const [form, setForm] = useState({
    senderName: shipment.senderName || '',
    consigneeName: shipment.consigneeName || '',
    origin: shipment.origin || '',
    destination: shipment.destination || '',
    weight: shipment.weight ?? '',
    description: shipment.description || '',
    shippingMethod: shipment.shippingMethod || '',
    status: shipment.status || 'PENDING',
    expectedDeliveryDate: shipment.expectedDeliveryDate
      ? new Date(shipment.expectedDeliveryDate).toISOString().slice(0, 10)
      : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateShipment(shipment.id, {
        ...form,
        weight: Number(form.weight),
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update shipment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="card w-full max-w-lg p-6 shadow-xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Edit Shipment #{shipment.shipmentCode}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Sender</label>
              <input className="input-field text-sm" value={form.senderName} onChange={update('senderName')} />
            </div>
            <div>
              <label className="input-label">Consignee</label>
              <input className="input-field text-sm" value={form.consigneeName} onChange={update('consigneeName')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Origin</label>
              <input className="input-field text-sm" value={form.origin} onChange={update('origin')} />
            </div>
            <div>
              <label className="input-label">Destination</label>
              <input className="input-field text-sm" value={form.destination} onChange={update('destination')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Weight (kg)</label>
              <input type="number" className="input-field text-sm" value={form.weight} onChange={update('weight')} />
            </div>
            <div>
              <label className="input-label">Status</label>
              <select className="input-field text-sm" value={form.status} onChange={update('status')}>
                {EDIT_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input-field text-sm min-h-[60px]" value={form.description} onChange={update('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Shipping Method</label>
              <input className="input-field text-sm" value={form.shippingMethod} onChange={update('shippingMethod')} />
            </div>
            <div>
              <label className="input-label">Expected Delivery</label>
              <input type="date" className="input-field text-sm" value={form.expectedDeliveryDate} onChange={update('expectedDeliveryDate')} />
            </div>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CargoList() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [editingShipment, setEditingShipment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadShipments = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchShipments({ search, status: statusFilter, sortBy })
      .then((data) => setShipments(data.shipments || []))
      .catch((err) => {
        setError(err.message || 'Failed to load shipments.');
        setShipments([]);
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(shipments.length / PAGE_SIZE));
  const paginated = shipments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const canDelete = user?.role === 'ADMIN';

  const handleDelete = async (shipment) => {
    if (!window.confirm(`Delete shipment ${shipment.shipmentCode}? This cannot be undone.`)) return;
    setDeletingId(shipment.id);
    try {
      await deleteShipment(shipment.id);
      await loadShipments();
    } catch (err) {
      setError(err.message || 'Failed to delete shipment.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Cargo Booking</h1>
          <p className="page-subtitle">Manage all cargo bookings and deliveries.</p>
        </div>
        <Link to="/cargo/new" className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add</span>
          New Booking
        </Link>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm" placeholder="Search by ID, customer, destination..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-10 text-sm w-full sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : STATUS_MAP[s]?.label || s}</option>)}
        </select>
        <select className="input-field h-10 text-sm w-full sm:w-52 min-w-[180px]" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Sort: Newest</option>
          <option value="weight">Sort: Weight</option>
        </select>
      </div>

      <p className="text-body-sm text-on-surface-variant">
        {loading ? 'Loading shipments...' : `${shipments.length} shipment${shipments.length !== 1 ? 's' : ''} found`}
      </p>
      {error && <p className="text-sm text-error">{error}</p>}

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
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant">Loading shipments...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
                    No shipments match your filters.
                  </td>
                </tr>
              ) : paginated.map((s) => {
                const st = STATUS_MAP[s.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={s.id}>
                    <td><span className="font-mono font-bold text-accent">#{s.shipmentCode}</span></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-[9px] font-bold text-on-primary-fixed flex-shrink-0">
                          {s.customerName.split(' ').map((n) => n[0]).join('')}
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
                        <Link to={`/track?code=${encodeURIComponent(s.shipmentCode)}`} className="btn-ghost p-1.5" title="Track">
                          <span className="material-symbols-outlined text-base">location_on</span>
                        </Link>
                        <button type="button" onClick={() => setEditingShipment(s)} className="btn-ghost p-1.5" title="Edit">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            disabled={deletingId === s.id}
                            className="btn-ghost p-1.5 hover:bg-error-container hover:text-on-error-container"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">
            Showing {paginated.length} of {shipments.length} results (page {page} of {totalPages})
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-xs font-semibold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-xs font-semibold bg-primary text-on-primary rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editingShipment && (
        <EditShipmentModal
          shipment={editingShipment}
          onClose={() => setEditingShipment(null)}
          onSaved={loadShipments}
        />
      )}
    </div>
  );
}
