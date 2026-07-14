import { useEffect, useMemo, useState } from 'react';
import { fetchShipmentHistory } from '../../lib/cargoApi';
import PageFooter from '../../components/layout/PageFooter';

const STATUS_BADGES = {
  Completed: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-700',
};

const FILTER_OPTIONS = [
  { value: 'All', label: 'All Shipments' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Not Completed', label: 'Not Completed' },
];

function isCompletedStatus(status) {
  return status === 'Completed';
}

function normalizeHistoryRecords(raw = []) {
  return (raw || []).map((r) => ({
    id: r.id || r._id || r.shipmentId || String(Math.random()).slice(2),
    shipmentId: r.shipmentId || r.shipment_code || r.code || r.id || r._id || '',
    completedDate: r.completedDate || r.completed_date || r.completed_at || r.completedOn || '',
    completedAt: r.completedAt || r.completed_at || r.completed_date || r.deliveryDate || r.archivedAt || r.updatedAt || '',
    customer: r.customer || r.customerName || r.customer_name || r.client || 'Unknown',
    route: r.route || r.routeId || r.route_id || r.routeName || '',
    finalStatus: r.finalStatus || r.status || r.final_status || 'Unknown',
  }));
}

export default function ShipmentHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchShipmentHistory()
      .then((data) => {
        if (!active) return;
        const raw = data.history || data.records || data || [];
        setRecords(normalizeHistoryRecords(raw));
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load shipment history.');
        setRecords([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    if (statusFilter === 'All') return records;

    return records.filter((record) => {
      const status = record.finalStatus || record.status || record.final_status || 'Unknown';

      if (statusFilter === 'Completed') {
        return isCompletedStatus(status);
      }

      if (statusFilter === 'Not Completed') {
        return !isCompletedStatus(status);
      }

      return true;
    });
  }, [records, statusFilter]);

  const formatDate = (d) => {
    if (!d) return '';
    const t = Date.parse(d);
    if (Number.isNaN(t)) return d;
    return new Date(t).toLocaleDateString();
  };

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;

    const headers = ['Shipment ID', 'Completed Date', 'Customer', 'Route', 'Final Status'];
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = filteredRecords.map((record) => [
      record.shipmentId || record.id,
      formatDate(record.completedDate),
      record.customer,
      record.route,
      record.finalStatus,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shipment-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="page-title">Shipment History</h1>
        <button type="button" className="btn-secondary text-sm py-2 px-4 self-start sm:self-auto" onClick={handleExportCsv} disabled={filteredRecords.length === 0}>
          <span className="material-symbols-outlined text-base">download</span>
          Export CSV
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="card p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">Filter Shipments</h2>
            <p className="text-xs text-on-surface-variant mt-1">Show completed or not completed shipments.</p>
          </div>
          <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/50">
            {statusFilter === 'All' ? 'All Shipments' : statusFilter}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FILTER_OPTIONS.map((option) => {
            const active = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${active
                  ? 'border-accent bg-accent/10 text-on-surface'
                  : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:border-accent/40 hover:text-on-surface'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs mt-1">
                  {option.value === 'All'
                    ? `${records.length} shipments`
                    : option.value === 'Completed'
                      ? `${records.filter((record) => isCompletedStatus(record.finalStatus)).length} completed`
                      : `${records.filter((record) => !isCompletedStatus(record.finalStatus)).length} not completed`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md font-semibold text-on-surface mb-4">Archive Overview</h2>
          <p className="text-sm text-on-surface-variant">Total Archived Records</p>
          <p className="text-4xl font-bold text-on-surface mt-1">{filteredRecords.length.toLocaleString()}</p>
          <div className="flex flex-wrap gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{filteredRecords.filter((record) => record.finalStatus === 'Completed').length.toLocaleString()}</span> Completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{filteredRecords.filter((record) => record.finalStatus === 'Cancelled').length.toLocaleString()}</span> Cancelled
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-xs uppercase tracking-wider">Shipment ID</th>
                <th className="text-xs uppercase tracking-wider">Completed Date</th>
                <th className="text-xs uppercase tracking-wider">Customer</th>
                <th className="text-xs uppercase tracking-wider">Route</th>
                <th className="text-xs uppercase tracking-wider">Final Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-on-surface-variant">Loading shipment history...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-on-surface-variant">No shipments match the selected filters.</td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = record.finalStatus || record.status || record.final_status || 'Unknown';
                  const badgeClass = STATUS_BADGES[status] || 'bg-slate-100 text-slate-600';
                  const key = record.id || record._id || record.shipmentId || record.shipment_code || `${record.shipmentId}-${record.completedDate}`;
                  return (
                    <tr key={key}>
                      <td className="font-semibold text-on-surface">{record.shipmentId || record.id}</td>
                      <td className="text-on-surface-variant">{formatDate(record.completedDate || record.completedAt)}</td>
                      <td>{record.customer}</td>
                      <td className="text-on-surface-variant">{record.route}</td>
                      <td>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
