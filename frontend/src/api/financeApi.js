
const API_URL = 'http://localhost:5001';

async function request(path, options = {}) {
  const token = localStorage.getItem('lf_token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

const get = (path) => request(path, { method: 'GET' });
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

// ─── Finance Dashboard & Reports ───────────────────────────
export const getDashboard = () => get('/api/finance/dashboard');
export const getRevenueReport = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/api/finance/reports/revenue${qs ? `?${qs}` : ''}`);
};
export const getExpenseReport = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/api/finance/reports/expenses${qs ? `?${qs}` : ''}`);
};
export const getProfitLossReport = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/api/finance/reports/profit-loss${qs ? `?${qs}` : ''}`);
};

// ─── Invoices ───────────────────────────────────────────────
export const getInvoices = () => get('/api/invoices');
export const getInvoiceById = (id) => get(`/api/invoices/${id}`);
export const getInvoiceFormOptions = () => get('/api/invoices/meta/options');
export const createInvoice = (payload) => post('/api/invoices', payload);
export const updateInvoice = (id, payload) => put(`/api/invoices/${id}`, payload);
export const deleteInvoice = (id) => del(`/api/invoices/${id}`);

// ─── Payments ───────────────────────────────────────────────
export const getPayments = () => get('/api/payments');
export const getPaymentById = (id) => get(`/api/payments/${id}`);
export const createPayment = (payload) => post('/api/payments', payload);
export const updatePayment = (id, payload) => put(`/api/payments/${id}`, payload);
export const deletePayment = (id) => del(`/api/payments/${id}`);
export const getReceipt = (id) => get(`/api/payments/${id}/receipt`);

// ─── Expenses ───────────────────────────────────────────────
export const getExpenses = () => get('/api/expenses');
export const getExpenseById = (id) => get(`/api/expenses/${id}`);
export const createExpense = (payload) => post('/api/expenses', payload);
export const updateExpense = (id, payload) => put(`/api/expenses/${id}`, payload);
export const deleteExpense = (id) => del(`/api/expenses/${id}`);
