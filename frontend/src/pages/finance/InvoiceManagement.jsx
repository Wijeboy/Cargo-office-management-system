import React, { useState, useEffect } from "react";
import { Download, Plus, Search, Calendar } from "lucide-react";

const statusStyles = {
  PAID: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  OVERDUE: "bg-rose-50 text-rose-600",
};

const filterTabs = ["All", "Paid", "Pending", "Overdue"];

export default function InvoiceManagement({ onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('lf_token');
        const response = await fetch('http://localhost:5001/api/invoices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to load invoices from database.');
        }
        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Filtering & Search
  const filtered = invoices.filter((inv) => {
    // 1. Status Filter
    const matchesStatus =
      activeFilter === "All" ||
      inv.paymentStatus?.toUpperCase() === activeFilter.toUpperCase();

    // 2. Search Term Filter (Invoice Number, Client Name, Company)
    const matchesSearch =
      inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.filter(inv => inv.paymentStatus?.toUpperCase() === 'PAID')
                            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPending = invoices.filter(inv => inv.paymentStatus?.toUpperCase() === 'PENDING')
                              .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOverdue = invoices.filter(inv => inv.paymentStatus?.toUpperCase() === 'OVERDUE')
                              .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  const getDueDateString = (invoiceDate) => {
    if (!invoiceDate) return 'N/A';
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 30); // Default Net 30
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-3xl text-indigo-600">progress_activity</span>
          <p className="text-gray-500 font-medium text-sm">Loading invoices...</p>
        </div>
      </div>
    );
  }

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

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Invoiced" value={formatCurrency(totalInvoiced)} valueColor="text-gray-900" />
        <SummaryCard label="Paid" value={formatCurrency(totalPaid)} valueColor="text-emerald-600" />
        <SummaryCard label="Pending" value={formatCurrency(totalPending)} valueColor="text-amber-500" />
        <SummaryCard label="Overdue" value={formatCurrency(totalOverdue)} valueColor="text-rose-600" />
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
            <Calendar className="w-3.5 h-3.5" />
            All Time
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
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No invoices found matching current criteria.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium">Due (Net 30)</th>
                  <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                  <th className="px-4 py-3 font-medium text-right">Tax</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const status = inv.paymentStatus?.toUpperCase() || 'PAID';
                  const formattedStatus = status.charAt(0) + status.slice(1).toLowerCase();
                  const invoiceSubtotal = (inv.totalAmount || 0) - (inv.tax || 0);

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition"
                    >
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => onNavigate("print-receipt", inv)}
                          className="text-indigo-600 font-semibold hover:underline"
                        >
                          {inv.invoiceNo}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900">{inv.customer?.name}</div>
                        {inv.customer?.company && (
                          <div className="text-[11px] text-gray-400">{inv.customer.company}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">
                        {new Date(inv.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">
                        {getDueDateString(inv.date)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-700 font-medium">
                        {formatCurrency(invoiceSubtotal)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-700">
                        {formatCurrency(inv.tax || 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-900 font-bold">
                        {formatCurrency(inv.totalAmount || 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[status] || 'bg-gray-150 text-gray-600'}`}
                        >
                          {formattedStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {invoices.length} invoices</p>
          <div className="flex items-center gap-2">
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              Prev
            </button>
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, valueColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
