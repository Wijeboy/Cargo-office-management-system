import React, { useEffect, useState } from "react";
import { TrendingDown, FileBarChart2, Receipt, ListChecks } from "lucide-react";
import { getProfitLossReport } from "../../api/financeApi";

const reportLinks = [
  {
    icon: TrendingDown,
    title: "Profit & Loss",
    desc: "Revenue vs costs, all-time",
  },
  {
    icon: FileBarChart2,
    title: "Revenue Report",
    desc: "Breakdown by method and client",
  },
  {
    icon: Receipt,
    title: "Expense Report",
    desc: "Spending by category",
  },
  {
    icon: ListChecks,
    title: "Transaction History",
    desc: "Every invoice, payment, and expense",
  },
];

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function FinancialReports({ onNavigate }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getProfitLossReport()
      .then((res) => {
        if (isMounted) setReport(res.report);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Reports</p>
          <h1 className="text-xl font-semibold text-gray-900">Financial Reports</h1>
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2">
          Failed to load report: {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-xl font-semibold text-emerald-600 mt-1">
            {loading ? "…" : currency(report?.totalRevenue)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-xl font-semibold text-rose-600 mt-1">
            {loading ? "…" : currency(report?.totalExpenses)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {loading ? "…" : currency(report?.netProfit)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Profit Margin</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {loading ? "…" : `${report?.profitMargin ?? 0}%`}
          </p>
        </div>
      </div>

      {/* Report shortcuts */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportLinks.map((r) => (
          <div
            key={r.title}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <r.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{r.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              {r.title === "Transaction History" && (
                <button
                  onClick={() => onNavigate("payments")}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Open &rarr;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
