import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getExpenses } from "../../api/financeApi";

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

export default function ExpenseManagement({ onNavigate }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getExpenses()
      .then((res) => {
        if (isMounted) setExpenses(res.expenses || []);
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

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const categoryData = useMemo(() => {
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    return Object.entries(byCategory).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  const largestCategory = useMemo(() => {
    if (categoryData.length === 0) return null;
    return categoryData.reduce((max, c) => (c.amount > max.amount ? c : max), categoryData[0]);
  }, [categoryData]);

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

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2">
          Failed to load expenses: {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{currency(totalExpenses)}</p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} records</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Largest Category</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{largestCategory?.category || "—"}</p>
          <p className="text-xs text-gray-400 mt-1">{largestCategory ? currency(largestCategory.amount) : "—"}</p>
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                      Loading expenses…
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{e.expenseNo}</td>
                      <td className="px-4 py-3 text-gray-900">{e.category}</td>
                      <td className="px-4 py-3 text-gray-500">{e.vendor || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{e.paymentMethod || "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">{currency(e.amount)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{formatDate(e.expenseDate)}</td>
                    </tr>
                  ))
                )}
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
            <p className="text-xs text-gray-400">Showing {expenses.length} expenses</p>
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
                <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => currency(v)} />
                <Bar dataKey="amount" fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {categoryData.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="text-gray-500">{c.category}</span>
                <span className="text-gray-900 font-medium">{currency(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
