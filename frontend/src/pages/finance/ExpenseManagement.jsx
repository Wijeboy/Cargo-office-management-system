import React from "react";
import { Plus, Paperclip } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const expenses = [
  { id: "EXP-4401", category: "Fuel", vendor: "Shell Fleet", method: "Card", amount: "$3,250", date: "Oct 24" },
  { id: "EXP-4400", category: "Salaries", vendor: "Payroll Inc.", method: "Bank", amount: "$41,200", date: "Oct 22" },
  { id: "EXP-4399", category: "Maintenance", vendor: "AutoFix Garage", method: "Cash", amount: "$1,180", date: "Oct 20" },
  { id: "EXP-4398", category: "Utilities", vendor: "City Power Co.", method: "Bank", amount: "$860", date: "Oct 18" },
  { id: "EXP-4397", category: "Office", vendor: "Staples", method: "Card", amount: "$320", date: "Oct 16" },
];

const categoryData = [
  { category: "Fuel", amount: 12 },
  { category: "Salaries", amount: 41 },
  { category: "Maint.", amount: 8 },
  { category: "Utilities", amount: 6 },
  { category: "Office", amount: 3 },
];

export default function ExpenseManagement({ onNavigate }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Expenses</p>
          <h1 className="text-xl font-semibold text-gray-900">Expense Management</h1>
        </div>
        <div className="flex items-center gap-2">
                    <button
            onClick={() => onNavigate("add-expense")}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">$1,568,000</p>
          <p className="text-xs text-gray-400 mt-1">this quarter</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Largest Category</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">Salaries</p>
          <p className="text-xs text-gray-400 mt-1">$580,000</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 bg-gray-900">
          <p className="text-sm text-gray-300 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" />
            Receipts Attached
          </p>
          <p className="text-xl font-semibold text-white mt-1">$2,000,000</p>
          <button className="text-xs text-indigo-300 hover:text-indigo-200 mt-1">receipts.zip</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent expenses table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <p className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
            Recent Expenses
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Vendor</th>
                  <th className="px-4 py-2 font-medium">Method</th>
                  <th className="px-4 py-2 font-medium text-right">Amount</th>
                  <th className="px-4 py-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-indigo-600 font-medium">{e.id}</td>
                    <td className="px-4 py-3 text-gray-900">{e.category}</td>
                    <td className="px-4 py-3 text-gray-500">{e.vendor}</td>
                    <td className="px-4 py-3 text-gray-500">{e.method}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{e.amount}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => onNavigate("add-expense")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              + New expense
            </button>
            <p className="text-xs text-gray-400">Showing 5 of 212 expenses</p>
          </div>
        </div>

        {/* Category summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Category Summary</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="amount" fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {categoryData.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="text-gray-500">{c.category}</span>
                <span className="text-gray-900 font-medium">${c.amount}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
