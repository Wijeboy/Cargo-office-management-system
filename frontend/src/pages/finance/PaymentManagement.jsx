import React, { useState } from "react";
import { Download, Plus, Search, Filter } from "lucide-react";

const transactions = [
  { id: "PMT-2201", client: "Global Freight Co.", amount: "$70,850", method: "Bank", ref: "REF-9081", date: "Oct 24", status: "Paid" },
  { id: "PMT-2200", client: "Apex Manufacturing", amount: "$18,400", method: "Card", ref: "REF-9080", date: "Oct 23", status: "Paid" },
  { id: "PMT-2199", client: "Acme Logistics Inc.", amount: "$12,150", method: "Bank", ref: "REF-9079", date: "Oct 22", status: "Pending" },
  { id: "PMT-2198", client: "Pinnacle Trading Co", amount: "$16,000", method: "Cash", ref: "REF-9078", date: "Oct 20", status: "Paid" },
  { id: "PMT-2197", client: "Harbor Shipping Ltd.", amount: "$8,200", method: "Bank", ref: "REF-9077", date: "Oct 18", status: "Overdue" },
];

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Overdue: "bg-rose-50 text-rose-600",
};

export default function PaymentManagement({ onNavigate }) {
  const [selected, setSelected] = useState(transactions[0]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank");
  const [received, setReceived] = useState("");

  const total = "$70,850";
  const outstanding = "$19,600";
  const collectionRate = "80%";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Payments</p>
          <h1 className="text-xl font-semibold text-gray-900">Payment Management</h1>
        </div>
        <div className="flex items-center gap-2">
                             <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: stats + table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{total}</p>
              <p className="text-xs text-gray-400 mt-1">4 payments</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-xl font-semibold text-rose-600 mt-1">{outstanding}</p>
              <p className="text-xs text-gray-400 mt-1">2 invoices</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Collection Rate</p>
              <p className="text-xl font-semibold text-emerald-600 mt-1">{collectionRate}</p>
              <p className="text-xs text-gray-400 mt-1">last 30 days</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search payment, client..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
                <Filter className="w-3.5 h-3.5" />
                Method
              </button>
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
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className={`border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/60 ${
                        selected?.id === t.id ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-900">{t.client}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{t.amount}</td>
                      <td className="px-4 py-3 text-gray-500">{t.method}</td>
                      <td className="px-4 py-3 text-gray-500">{t.ref}</td>
                      <td className="px-4 py-3 text-gray-500">{t.date}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[t.status]}`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing 5 of 84 payments</p>
              <p className="text-sm font-medium text-gray-900">Total $125,600</p>
            </div>
          </div>
        </div>

        {/* Right: record payment panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <p className="text-sm font-semibold text-gray-900 mb-4">Record Payment</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(`Recorded ${amount || "$0"} via ${method} for ${selected?.client || "client"}`);
              setAmount("");
              setReceived("");
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
              <input
                readOnly
                value={selected?.client || ""}
                placeholder="Select a row"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$0.00"
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
                <option>Bank</option>
                <option>Card</option>
                <option>Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Received on</label>
              <input
                type="date"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 mt-2"
            >
              Save payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
