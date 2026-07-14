const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getAuthToken() {
  return localStorage.getItem('lf_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export function fetchShipments(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/cargo/bookings${suffix}`);
}

export function createShipment(payload) {
  return request('/api/cargo/bookings', { method: 'POST', body: payload });
}

export function fetchTracking(shipmentCode) {
  return request(`/api/cargo/tracking/${encodeURIComponent(shipmentCode)}`, { auth: false });
}

export function fetchSchedulingDashboard() {
  return request('/api/cargo/scheduling');
}

export function fetchRoutes() {
  return request('/api/cargo/routes');
}

export function createRoute(payload) {
  return request('/api/cargo/routes', { method: 'POST', body: payload });
}

export function updateRoute(routeId, payload) {
  return request(`/api/cargo/routes/${encodeURIComponent(routeId)}`, { method: 'PUT', body: payload });
}

export function fetchVehicles() {
  return request('/api/cargo/vehicles');
}

export function createVehicle(payload) {
  return request('/api/cargo/vehicles', { method: 'POST', body: payload });
}

export function updateVehicle(vehicleId, payload) {
  return request(`/api/cargo/vehicles/${encodeURIComponent(vehicleId)}`, { method: 'PUT', body: payload });
}

export function fetchOperationsReport() {
  return request('/api/cargo/reports/operations');
}

export function fetchShipmentHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.dateRange) query.set('dateRange', params.dateRange);
  if (params.customer) query.set('customer', params.customer);
  if (params.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/cargo/history${suffix}`);
}

export function fetchShipmentById(id) {
  return request(`/api/cargo/bookings/${encodeURIComponent(id)}`);
}

export function updateShipment(id, payload) {
  return request(`/api/cargo/bookings/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export function deleteShipment(id) {
  return request(`/api/cargo/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function addTrackingEvent(shipmentId, payload) {
  return request(`/api/cargo/bookings/${encodeURIComponent(shipmentId)}/tracking-events`, {
    method: 'POST',
    body: payload,
  });
}

export function assignShipment(shipmentId, payload) {
  return request(`/api/cargo/scheduling/${encodeURIComponent(shipmentId)}/assign`, {
    method: 'POST',
    body: payload,
  });
}
