import { MOCK_INVOICES } from '../../data/mockData';
import { useState } from 'react';

const STATUS = {
  PAID: { label: 'Paid', class: 'badge-success' },
  PENDING: { label: 'Pending', class: 'badge-warning' },
  OVERDUE: { label: 'Overdue', class: 'badge-danger' },
};

export default function InvoiceList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const filtered = MOCK_INVOICES.filter(inv =>
    (statusFilter === 'ALL' || inv.paymentStatus === statusFilter) &&
    (inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
     inv.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = MOCK_INVOICES.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPending = MOCK_INVOICES.filter(i => i.paymentStatus === 'PENDING').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalOverdue = MOCK_INVOICES.filter(i => i.paymentStatus === 'OVERDUE').reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-subtitle">Invoice management, payment tracking, and financial records.</p>
        </div>
        <button className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add</span>
          New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Total Collected', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments', bg: 'bg-[#d1fae5]', color: 'text-[#065f46]' },
          { label: 'Pending Payment', value: `$${totalPending.toLocaleString()}`, icon: 'schedule', bg: 'bg-secondary-container', color: 'text-on-secondary-container' },
          { label: 'Overdue', value: `$${totalOverdue.toLocaleString()}`, icon: 'warning', bg: 'bg-error-container', color: 'text-on-error-container' },
        ].map(c => (
          <div key={c.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${c.color} material-symbols-filled`}>{c.icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">{c.label}</p>
              <p className="text-headline-md text-on-surface font-bold mt-0.5">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-10 text-sm w-full sm:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Customer</th>
                <th>Shipment</th>
                <th>Amount</th>
                <th>Tax</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const st = STATUS[inv.paymentStatus] || STATUS.PENDING;
                return (
                  <tr key={inv.id}>
                    <td className="font-mono font-bold text-on-surface">{inv.invoiceNo}</td>
                    <td className="font-medium">{inv.customerName}</td>
                    <td><span className="text-accent font-mono">#{inv.shipmentCode}</span></td>
                    <td className="font-semibold">${inv.totalAmount.toLocaleString()}</td>
                    <td className="text-on-surface-variant">${inv.tax.toLocaleString()}</td>
                    <td><span className={`badge ${st.class}`}>{st.label}</span></td>
                    <td className="text-on-surface-variant text-xs">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-ghost p-1.5"><span className="material-symbols-outlined text-base">download</span></button>
                        <button className="btn-ghost p-1.5"><span className="material-symbols-outlined text-base">edit</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
