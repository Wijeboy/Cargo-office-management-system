import React from "react";

const transactions = [
  {
    ref: "TXN-5821",
    description: "Apex Manufacturing — INV-1042",
    method: "Bank",
    date: "Oct 24",
    amount: "+$16,400",
    status: "Paid",
  },
  {
    ref: "TXN-5820",
    description: "Fuel & port handling",
    method: "Cash",
    date: "Oct 27",
    amount: "-$3,250",
    status: "Paid",
  },
  {
    ref: "TXN-5819",
    description: "Global Freight — INV-1041",
    method: "Bank",
    date: "Oct 27",
    amount: "+$9,800",
    status: "Pending",
  },
  {
    ref: "TXN-5817",
    description: "Acme Logistics — INV-1040",
    method: "Cash",
    date: "Oct 23",
    amount: "+$12,150",
    status: "Paid",
  },
];

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Overdue: "bg-rose-50 text-rose-600",
};

export default function TransactionsTable({ onNavigate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">Recent Transactions</p>
        <button  onClick={() => onNavigate("invoices")} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Reference</th>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
              <th className="px-4 py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.ref}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-4 py-3 text-gray-500">{t.ref}</td>
                <td className="px-4 py-3 text-gray-900">{t.description}</td>
                <td className="px-4 py-3 text-gray-500">{t.method}</td>
                <td className="px-4 py-3 text-gray-500">{t.date}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    t.amount.startsWith("-") ? "text-gray-900" : "text-gray-900"
                  }`}
                >
                  {t.amount}
                </td>
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
        <p className="text-xs text-gray-400">Showing 4 of 628 shipments</p>
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
  );
}
