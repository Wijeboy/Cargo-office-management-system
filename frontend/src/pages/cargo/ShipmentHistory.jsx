import { useState } from 'react';
import { MOCK_SHIPMENT_HISTORY, MOCK_ARCHIVE_STATS } from '../../data/mockData';
import PageFooter from '../../components/layout/PageFooter';

const STATUS_BADGES = {
  Completed: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-700',
};

const DEFAULT_FILTERS = {
  dateRange: 'Jan 01, 2023 - Dec 31, 2023',
  customer: 'All Customers',
  status: 'Any Status',
};

function parseDateRange(rangeStr) {
  const [startStr, endStr] = rangeStr.split(' - ').map(s => s.trim());
  return {
    start: new Date(startStr),
    end: new Date(endStr),
  };
}

function isWithinDateRange(dateStr, rangeStr) {
  const { start, end } = parseDateRange(rangeStr);
  const date = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

function filterHistory(records, filters) {
  return records.filter(record => {
    if (filters.status !== 'Any Status' && record.finalStatus !== filters.status) return false;
    if (filters.customer !== 'All Customers' && record.customer !== filters.customer) return false;
    if (!isWithinDateRange(record.completedDate, filters.dateRange)) return false;
    return true;
  });
}

export default function ShipmentHistory() {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const filtered = filterHistory(MOCK_SHIPMENT_HISTORY, appliedFilters);

  const updateDraft = (field) => (e) => {
    setDraftFilters(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleClearAll = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="page-title">Shipment History</h1>
        <button type="button" className="btn-secondary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">download</span>
          Export CSV
        </button>
      </div>

      {/* Overview & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Archive Overview */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md font-semibold text-on-surface mb-4">Archive Overview</h2>
          <p className="text-sm text-on-surface-variant">Total Archived Records</p>
          <p className="text-4xl font-bold text-on-surface mt-1">
            {MOCK_ARCHIVE_STATS.totalRecords.toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{MOCK_ARCHIVE_STATS.completed.toLocaleString()}</span> Completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{MOCK_ARCHIVE_STATS.cancelled.toLocaleString()}</span> Cancelled
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Filter */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md font-semibold text-on-surface mb-4">Advanced Filter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Date Range</label>
              <input
                className="input-field text-sm"
                value={draftFilters.dateRange}
                onChange={updateDraft('dateRange')}
              />
            </div>
            <div>
              <label className="input-label">Customer Name</label>
              <select
                className="input-field text-sm"
                value={draftFilters.customer}
                onChange={updateDraft('customer')}
              >
                <option>All Customers</option>
                <option>Acme Corp Logistics</option>
                <option>Global Exports Ltd</option>
                <option>Apex Manufacturing</option>
                <option>TechSupplies Inc</option>
              </select>
            </div>
            <div>
              <label className="input-label">Final Status</label>
              <select
                className="input-field text-sm"
                value={draftFilters.status}
                onChange={updateDraft('status')}
              >
                <option>Any Status</option>
                <option>Completed</option>
                <option>Archived</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button type="button" className="btn-primary text-sm py-2 px-5" onClick={handleApplyFilters}>
              Apply Filters
            </button>
            <button
              type="button"
              className="text-sm text-on-surface-variant hover:text-accent transition-colors"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                    No shipments match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.id}>
                    <td className="font-semibold text-on-surface">{record.shipmentId}</td>
                    <td className="text-on-surface-variant">{record.completedDate}</td>
                    <td>{record.customer}</td>
                    <td className="text-on-surface-variant">{record.route}</td>
                    <td>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGES[record.finalStatus]}`}>
                        {record.finalStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
