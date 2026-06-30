import { useState } from 'react';
import { MOCK_CUSTOMERS } from '../../data/mockData';

export default function CustomerList() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage customer profiles and account information.</p>
        </div>
        <button className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">person_add</span>
          Add Customer
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm w-full max-w-sm" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(c => (
          <div key={c.id} className="card-hover p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-base font-black text-on-primary-container flex-shrink-0">
                {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-on-surface truncate">{c.name}</p>
                {c.company && <p className="text-xs text-on-surface-variant truncate">{c.company}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base">mail</span>
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base">phone</span>
                <span>{c.contactNo}</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span className="truncate">{c.address}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-outline-variant">
              <button className="btn-secondary flex-1 text-xs py-1.5">
                <span className="material-symbols-outlined text-sm">visibility</span>
                View
              </button>
              <button className="btn-ghost flex-1 text-xs py-1.5">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
