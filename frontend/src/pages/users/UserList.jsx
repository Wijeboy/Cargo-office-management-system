import { MOCK_USERS } from '../../data/mockData';
import { useState } from 'react';

const ROLE_LABEL = {
  ADMIN: 'Admin',
  OPERATIONS: 'Operations',
  FINANCE: 'Finance',
  CUSTOMER_SERVICE: 'Customer Service',
  WAREHOUSE: 'Warehouse',
};
const ROLE_COLOR = {
  ADMIN: 'badge-danger',
  OPERATIONS: 'badge-info',
  FINANCE: 'badge-success',
  CUSTOMER_SERVICE: 'badge-warning',
  WAREHOUSE: 'badge-neutral',
};

export default function UserList() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and access control.</p>
        </div>
        <button className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">person_add</span>
          Add User
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-on-surface-variant">{u.email}</td>
                  <td><span className={`badge ${ROLE_COLOR[u.role] || 'badge-neutral'}`}>{ROLE_LABEL[u.role] || u.role}</span></td>
                  <td className="text-on-surface-variant">{u.department || '—'}</td>
                  <td>
                    <span className={`badge ${u.status ? 'badge-success' : 'badge-danger'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status ? 'bg-[#10b981]' : 'bg-error'}`} />
                      {u.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-on-surface-variant text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn-ghost p-1.5"><span className="material-symbols-outlined text-base">edit</span></button>
                      <button className="btn-ghost p-1.5 hover:bg-error-container hover:text-on-error-container">
                        <span className="material-symbols-outlined text-base">delete</span>
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
  );
}
