import { useState, useEffect } from 'react';

const ROLE_LABEL = {
  ADMIN: 'Admin',
  OPERATIONS: 'Operations Staff',
  FINANCE: 'Finance Staff',
  CUSTOMER_SERVICE: 'Customer Service',
  WAREHOUSE: 'Warehouse / Logistics',
  CUSTOMER: 'Customer',
};

const ROLE_COLOR = {
  ADMIN: 'badge-danger',
  OPERATIONS: 'badge-info',
  FINANCE: 'badge-success',
  CUSTOMER_SERVICE: 'badge-warning',
  WAREHOUSE: 'badge-neutral',
  CUSTOMER: 'badge-info',
};

const API_URL = 'http://localhost:5001';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OPERATIONS',
    department: '',
    phone: '',
    status: true,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('lf_token');
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please ensure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleOpenAddModal = () => {
    setModalType('add');
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'OPERATIONS',
      department: '',
      phone: '',
      status: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalType('edit');
    setCurrentUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank by default
      role: user.role || 'OPERATIONS',
      department: user.department || '',
      phone: user.phone || '',
      status: user.status !== undefined ? user.status : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      const token = localStorage.getItem('lf_token');
      try {
        const response = await fetch(`${API_URL}/api/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          fetchUsers();
        } else {
          alert(data.message || 'Failed to delete user.');
        }
      } catch (err) {
        alert('Failed to connect to backend.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const token = localStorage.getItem('lf_token');
    const url = modalType === 'add' 
      ? `${API_URL}/api/users` 
      : `${API_URL}/api/users/${currentUser.id}`;
    
    const method = modalType === 'add' ? 'POST' : 'PUT';

    const payload = { ...form };
    if (modalType === 'edit' && !payload.password) {
      delete payload.password; // Do not send empty password on update
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        setFormError(data.message || 'An error occurred during submission.');
      }
    } catch (err) {
      setFormError('Failed to connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and access control.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary text-sm py-2 px-4 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">person_add</span>
          Add User
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm animate-slide-up">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <div className="card p-4">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none">search</span>
          <input type="text" className="input-with-icon h-10 text-sm" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex justify-center items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin-slow">progress_activity</span>
              <span>Loading system users...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
              No users found matching search query.
            </div>
          ) : (
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
                          {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-on-surface-variant">{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_COLOR[u.role] || 'badge-neutral'}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </td>
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
                        <button onClick={() => handleOpenEditModal(u)} className="btn-ghost p-1.5"><span className="material-symbols-outlined text-base">edit</span></button>
                        <button onClick={() => handleDeleteUser(u)} className="btn-ghost p-1.5 hover:bg-error-container hover:text-on-error-container">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md shadow-card-hover overflow-hidden animate-slide-up">
            <header className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">{modalType === 'add' ? 'Add System User' : 'Edit User Profile'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-ghost p-1"><span className="material-symbols-outlined">close</span></button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-3 bg-error-container text-on-error-container px-4 py-2.5 rounded-lg text-xs">
                  <span className="material-symbols-outlined text-base">error</span>
                  {formError}
                </div>
              )}

              <div>
                <label className="input-label" htmlFor="m-name">Full Name</label>
                <input id="m-name" type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>

              <div>
                <label className="input-label" htmlFor="m-email">Email Address</label>
                <input id="m-email" type="email" className="input-field" placeholder="john.doe@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>

              <div>
                <label className="input-label" htmlFor="m-password">
                  {modalType === 'add' ? 'Password' : 'Password (Leave blank to keep current)'}
                </label>
                <input id="m-password" type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={modalType === 'add'} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label" htmlFor="m-role">Role</label>
                  <select id="m-role" className="input-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="ADMIN">Admin</option>
                    <option value="OPERATIONS">Operations Staff</option>
                    <option value="FINANCE">Finance Staff</option>
                    <option value="CUSTOMER_SERVICE">Customer Service</option>
                    <option value="WAREHOUSE">Warehouse / Logistics</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="input-label" htmlFor="m-dept">Department</label>
                  <input id="m-dept" type="text" className="input-field" placeholder="Operations" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="m-phone">Phone Number</label>
                <input id="m-phone" type="text" className="input-field" placeholder="+94 77 123 4567" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input id="m-status" type="checkbox" className="w-4 h-4 rounded border-outline-variant accent-accent" checked={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.checked }))} />
                <label htmlFor="m-status" className="text-body-sm text-on-surface-variant font-medium cursor-pointer">Active / Account enabled</label>
              </div>

              <footer className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-4">
                  {submitting ? 'Saving...' : 'Save User'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
