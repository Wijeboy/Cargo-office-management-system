import React, { useState } from "react";
import { Download, Plus, Search, Calendar } from "lucide-react";

const invoices = [
  { id: "INV-1042", client: "Apex Manufacturing", issued: "Oct 20", due: "Oct 24", subtotal: "+$18,400", tax: "$1,363", total: "$18,400", status: "Paid" },
  { id: "INV-1041", client: "Global Freight Co.", issued: "Oct 19", due: "Nov 03", subtotal: "$9,074", tax: "$726", total: "$9,800", status: "Pending" },
  { id: "INV-1040", client: "Acme Logistics Inc.", issued: "Oct 18", due: "Nov 02", subtotal: "$11,250", tax: "$900", total: "$12,150", status: "Paid" },
  { id: "INV-1039", client: "Harbor Shipping Ltd.", issued: "Oct 12", due: "Oct 27", subtotal: "$7,593", tax: "$607", total: "$8,200", status: "Overdue" },
  { id: "INV-1038", client: "Pinnacle Trading Co", issued: "Oct 10", due: "Oct 25", subtotal: "$14,815", tax: "$1,185", total: "$16,000", status: "Paid" },
  { id: "INV-1037", client: "Apex Manufacturing", issued: "Oct 20", due: "Oct 24", subtotal: "+$18,400", tax: "$1,363", total: "$18,400", status: "Paid" },
  { id: "INV-1036", client: "Apex Manufacturing", issued: "Oct 20", due: "Oct 24", subtotal: "+$18,400", tax: "$1,363", total: "$18,400", status: "Paid" },
  { id: "INV-1035", client: "Apex Manufacturing", issued: "Oct 20", due: "Oct 24", subtotal: "+$18,400", tax: "$1,383", total: "$18,400", status: "Paid" },
];

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Overdue: "bg-rose-50 text-rose-600",
};

const filterTabs = ["All", "Paid", "Pending", "Overdue"];

export default function InvoiceManagement({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? invoices
      : invoices.filter((i) => i.status === activeFilter);

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
                  {/* Link to the Generate Invoice page */}
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
        <SummaryCard label="Total Invoiced" value="$327,100" valueColor="text-gray-900" />
        <SummaryCard label="Paid" value="$284,920" valueColor="text-emerald-600" />
        <SummaryCard label="Pending" value="$33,980" valueColor="text-amber-500" />
        <SummaryCard label="Overdue" value="$8,200" valueColor="text-rose-600" />
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
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
                {tab}
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
                <th className="px-4 py-2 font-medium">Issued</th>
                <th className="px-4 py-2 font-medium">Due</th>
                <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                <th className="px-4 py-2 font-medium text-right">Tax 8%</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, idx) => (
                <tr
                  key={`${inv.id}-${idx}`}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onNavigate("invoice-form")}
                      className="text-indigo-600 font-medium hover:underline"
                    >
                      {inv.id}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{inv.client}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.issued}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.due}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{inv.subtotal}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{inv.tax}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">{inv.total}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing 8 of 428 shipments</p>
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
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
