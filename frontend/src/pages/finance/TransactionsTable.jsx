import React from "react";

const statusStyles = {
  COMPLETED: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  FAILED: "bg-rose-50 text-rose-600",
};

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

// `payments` is the API's recentPayments array from GET /api/finance/dashboard
export default function TransactionsTable({ payments }) {
  const rows = payments || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">Recent Transactions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Payment No.</th>
              <th className="px-4 py-2 font-medium">Reference</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
              <th className="px-4 py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{t.paymentNo}</td>
                  <td className="px-4 py-3 text-gray-500">{t.reference || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{t.method}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(t.paymentDate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {currency(t.amount)}
                  </td>
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
    </div>
  );
}
