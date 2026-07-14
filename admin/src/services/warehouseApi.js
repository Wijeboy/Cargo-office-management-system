const API_URL = 'http://localhost:5001';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

export const warehouseApi = {
  dashboard: () => request('/api/warehouse/dashboard'),
  inventory: (search = '') => request(`/api/warehouse/inventory${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  inventoryStats: () => request('/api/warehouse/inventory/stats'),
  createInventory: (payload) => request('/api/warehouse/inventory', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateInventory: (id, payload) => request(`/api/warehouse/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteInventory: (id) => request(`/api/warehouse/inventory/${id}`, { method: 'DELETE' }),
  incoming: (search = '') => request(`/api/warehouse/incoming${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  incomingStats: () => request('/api/warehouse/incoming/stats'),
  createIncoming: (payload) => request('/api/warehouse/incoming', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateIncoming: (id, payload) => request(`/api/warehouse/incoming/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteIncoming: (id) => request(`/api/warehouse/incoming/${id}`, { method: 'DELETE' }),
  outgoing: (search = '') => request(`/api/warehouse/outgoing${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  outgoingStats: () => request('/api/warehouse/outgoing/stats'),
  createOutgoing: (payload) => request('/api/warehouse/outgoing', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateOutgoing: (id, payload) => request(`/api/warehouse/outgoing/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteOutgoing: (id) => request(`/api/warehouse/outgoing/${id}`, { method: 'DELETE' }),
  storage: (search = '') => request(`/api/warehouse/storage${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  storageStats: () => request('/api/warehouse/storage/stats'),
  createStorage: (payload) => request('/api/warehouse/storage', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateStorage: (id, payload) => request(`/api/warehouse/storage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteStorage: (id) => request(`/api/warehouse/storage/${id}`, { method: 'DELETE' }),
  incidents: (search = '') => request(`/api/warehouse/incidents${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  incidentStats: () => request('/api/warehouse/incidents/stats'),
  createIncident: (payload) => request('/api/warehouse/incidents', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateIncident: (id, payload) => request(`/api/warehouse/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteIncident: (id) => request(`/api/warehouse/incidents/${id}`, { method: 'DELETE' }),
};
