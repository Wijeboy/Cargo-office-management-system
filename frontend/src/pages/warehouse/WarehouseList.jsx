import { MOCK_WAREHOUSE } from '../../data/mockData';
import { useState } from 'react';

const STATUS = {
  SAFE: { label: 'Safe', class: 'badge-success', icon: 'check_circle' },
  DAMAGED: { label: 'Damaged', class: 'badge-danger', icon: 'warning' },
  LOST: { label: 'Lost', class: 'badge-danger', icon: 'error' },
};

export default function WarehouseList() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_WAREHOUSE.filter(w =>
    w.shipmentCode.toLowerCase().includes(search.toLowerCase()) ||
    w.customerName.toLowerCase().includes(search.toLowerCase()) ||
    w.warehouseLocation.toLowerCase().includes(search.toLowerCase())
  );

  const safeCt = MOCK_WAREHOUSE.filter(w => w.status === 'SAFE').length;
  const damagedCt = MOCK_WAREHOUSE.filter(w => w.status === 'DAMAGED').length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Warehouse</h1>
          <p className="page-subtitle">Inventory, cargo storage, and condition management.</p>
        </div>
        <button className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add</span>
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Total Items', value: MOCK_WAREHOUSE.length, icon: 'inventory_2', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed' },
          { label: 'Safe', value: safeCt, icon: 'check_circle', bg: 'bg-[#d1fae5]', color: 'text-[#065f46]' },
          { label: 'Damaged / Lost', value: damagedCt, icon: 'warning', bg: 'bg-error-container', color: 'text-on-error-container' },
        ].map(c => (
          <div key={c.label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${c.color} material-symbols-filled`}>{c.icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">{c.label}</p>
              <p className="text-headline-md font-bold text-on-surface">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm" placeholder="Search warehouse items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Barcode/QR</th>
                <th>Storage Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const st = STATUS[w.status];
                return (
                  <tr key={w.id}>
                    <td><span className="font-mono font-bold text-accent">#{w.shipmentCode}</span></td>
                    <td className="font-medium">{w.customerName}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-base">warehouse</span>
                        {w.warehouseLocation}
                      </span>
                    </td>
                    <td><span className="font-mono text-xs text-on-surface-variant">{w.barcodeQR || '—'}</span></td>
                    <td className="text-on-surface-variant text-xs">{new Date(w.storageDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${st.class}`}>
                        <span className={`material-symbols-outlined text-xs material-symbols-filled`}>{st.icon}</span>
                        {st.label}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-ghost p-1.5"><span className="material-symbols-outlined text-base">qr_code</span></button>
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
