import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Calendar } from "lucide-react";
import { getInvoices } from "../../api/financeApi";

const statusStyles = {
  PAID: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  PARTIALLY_PAID: "bg-amber-50 text-amber-600",
  OVERDUE: "bg-rose-50 text-rose-600",
};

const filterTabs = ["All", "PAID", "PENDING", "PARTIALLY_PAID"];

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

export default function InvoiceManagement({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getInvoices()
      .then((res) => {
        if (isMounted) setInvoices(res.invoices || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = invoices;
    if (activeFilter !== "All") {
      list = list.filter((i) => i.paymentStatus === activeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.customer?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, activeFilter, search]);

  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paid = invoices.filter((i) => i.paymentStatus === "PAID").reduce((s, i) => s + i.totalAmount, 0);
    const pending = invoices.filter((i) => i.paymentStatus === "PENDING").reduce((s, i) => s + i.totalAmount, 0);
    const partial = invoices.filter((i) => i.paymentStatus === "PARTIALLY_PAID").reduce((s, i) => s + i.totalAmount, 0);
    return { totalInvoiced, paid, pending, partial };
  }, [invoices]);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb + heading + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Invoices</p>
          <h1 className="text-xl font-semibold text-gray-900">Invoice Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => onNavigate("invoice-form")}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2">
          Failed to load invoices: {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Invoiced" value={currency(totals.totalInvoiced)} valueColor="text-gray-900" />
        <SummaryCard label="Paid" value={currency(totals.paid)} valueColor="text-emerald-600" />
        <SummaryCard label="Pending" value={currency(totals.pending)} valueColor="text-amber-500" />
        <SummaryCard label="Partially Paid" value={currency(totals.partial)} valueColor="text-amber-500" />
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice or client..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
            <Calendar className="w-3.5 h-3.5" />
            This month
          </button>

          <div className="flex items-center gap-1.5">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  activeFilter === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2 font-medium">Invoice</th>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                <th className="px-4 py-2 font-medium text-right">Tax</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-sm">
                    Loading invoices…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-sm">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onNavigate("invoice-form")}
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        {inv.invoiceNo}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{inv.customer?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {currency(inv.totalAmount - inv.tax)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{currency(inv.tax)}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {currency(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          statusStyles[inv.paymentStatus] || "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {inv.paymentStatus.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {invoices.length} invoices</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, valueColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
