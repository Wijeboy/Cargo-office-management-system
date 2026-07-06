import React from "react";
import { Download, TrendingDown, FileBarChart2, Receipt, PieChart, ListChecks, Landmark } from "lucide-react";

const reportLinks = [
  {
    icon: TrendingDown,
    title: "Profit & Loss",
    desc: "Revenue vs costs by month",
  },
  {
    icon: FileBarChart2,
    title: "Revenue Report",
    desc: "Breakdown by client and category",
  },
  {
    icon: Receipt,
    title: "Expense Report",
    desc: "Spending by category and vendor",
  },
  {
    icon: PieChart,
    title: "Tax Summary",
    desc: "Collected and owed tax, by period",
  },
  {
    icon: ListChecks,
    title: "Transaction History",
    desc: "Every invoice, payment, and expense",
  },
  {
    icon: Landmark,
    title: "Cash vs Bank",
    desc: "Balances across accounts",
  },
];

export default function FinancialReports({ onNavigate }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Reports</p>
          <h1 className="text-xl font-semibold text-gray-900">Financial Reports</h1>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-600 bg-gray-50 focus:outline-none">
            <option>This quarter</option>
            <option>This month</option>
            <option>This year</option>
          </select>
          <button className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-xl font-semibold text-emerald-600 mt-1">$284,920</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-xl font-semibold text-rose-600 mt-1">$98,430</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">$186,490</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Tax (8%)</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">$21,090</p>
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
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2">
                Open &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
