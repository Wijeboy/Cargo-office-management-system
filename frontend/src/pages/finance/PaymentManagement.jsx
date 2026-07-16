import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getPayments, createPayment, getInvoices } from "../../api/financeApi";

const statusStyles = {
  COMPLETED: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  FAILED: "bg-rose-50 text-rose-600",
};

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

export default function PaymentManagement({ onNavigate }) {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [receivedOn, setReceivedOn] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([getPayments(), getInvoices()])
      .then(([paymentsRes, invoicesRes]) => {
        setPayments(paymentsRes.payments || []);
        setInvoices(invoicesRes.invoices || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.trim().toLowerCase();
    return payments.filter(
      (p) =>
        p.paymentNo.toLowerCase().includes(q) ||
        p.invoice?.customer?.name?.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q)
    );
  }, [payments, search]);

  const totals = useMemo(() => {
    const totalReceived = payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((s, p) => s + p.amount, 0);
    const outstandingInvoices = invoices.filter(
      (i) => i.paymentStatus === "PENDING" || i.paymentStatus === "PARTIALLY_PAID"
    );
    const outstanding = outstandingInvoices.reduce((s, i) => s + i.totalAmount, 0);
    return { totalReceived, outstanding, count: outstandingInvoices.length };
  }, [payments, invoices]);

  const handleSelectRow = (p) => {
    setSelected(p);
    setInvoiceId(p.invoiceId);
    setAmount("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!invoiceId || !amount) {
      setSubmitError("Please select an invoice and enter an amount.");
      return;
    }

    setSubmitting(true);
    try {
      await createPayment({
        invoiceId,
        amount: Number(amount),
        method,
        reference: reference || undefined,
        paymentDate: receivedOn || undefined,
      });
      setAmount("");
      setReference("");
      setReceivedOn("");
      loadData();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Payments</p>
          <h1 className="text-xl font-semibold text-gray-900">Payment Management</h1>
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2">
          Failed to load data: {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: stats + table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{currency(totals.totalReceived)}</p>
              <p className="text-xs text-gray-400 mt-1">{payments.length} payments</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-xl font-semibold text-rose-600 mt-1">{currency(totals.outstanding)}</p>
              <p className="text-xs text-gray-400 mt-1">{totals.count} invoices</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Invoices</p>
              <p className="text-xl font-semibold text-emerald-600 mt-1">{invoices.length}</p>
              <p className="text-xs text-gray-400 mt-1">total on record</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search payment, client, reference..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <button
                onClick={() => onNavigate("invoices")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View invoices
              </button>
            </div>

            <p className="px-4 pt-3 text-xs font-medium text-gray-400">Recent Transactions</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">Client</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Method</th>
                    <th className="px-4 py-2 font-medium">Reference</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                        Loading payments…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => handleSelectRow(t)}
                        className={`border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/60 ${
                          selected?.id === t.id ? "bg-indigo-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-900">{t.invoice?.customer?.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{currency(t.amount)}</td>
                        <td className="px-4 py-3 text-gray-500">{t.method}</td>
                        <td className="px-4 py-3 text-gray-500">{t.reference || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(t.paymentDate)}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                              statusStyles[t.status] || "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing {filtered.length} of {payments.length} payments</p>
              <p className="text-sm font-medium text-gray-900">Total {currency(totals.totalReceived)}</p>
            </div>
          </div>
        </div>

        {/* Right: record payment panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <p className="text-sm font-semibold text-gray-900 mb-4">Record Payment</p>
          {submitError && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 mb-3">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice</label>
              <select
                required
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select an invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNo} — {inv.customer?.name} ({currency(inv.totalAmount)})
                  </option>
                ))}
              </select>
              {selectedInvoice && (
                <p className="text-xs text-gray-400 mt-1">
                  Status: {selectedInvoice.paymentStatus.replace("_", " ")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reference</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Optional transaction reference"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Received on</label>
              <input
                type="date"
                value={receivedOn}
                onChange={(e) => setReceivedOn(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 mt-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
