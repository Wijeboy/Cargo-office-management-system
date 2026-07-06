import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", invoice: 60, expenses: 40 },
  { month: "Feb", invoice: 78, expenses: 55 },
  { month: "Mar", invoice: 45, expenses: 30 },
  { month: "Apr", invoice: 52, expenses: 35 },
  { month: "May", invoice: 38, expenses: 20 },
  { month: "Jun", invoice: 70, expenses: 48 },
  { month: "Jul", invoice: 62, expenses: 42 },
];

export function RevenueExpensesChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 lg:col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Revenue vs Expenses</p>
          <p className="text-xs text-gray-400">Monthly &middot; 2024</p>
        </div>
        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-gray-50 focus:outline-none">
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Invoice
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300" /> Expenses
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} barGap={4}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E2E8F0" }}
            />
            <Bar dataKey="invoice" fill="#818CF8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#FDA4AF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const statusData = [
  { name: "Paid", value: 68, color: "#6366F1" },
  { name: "Pending", value: 24, color: "#FDBA74" },
  { name: "Overdue", value: 8, color: "#5EEAD4" },
];

export function InvoiceStatusChart() {
  const total = 128;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">Invoice Status</p>

      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-gray-900">{total}</span>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {statusData.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </span>
            <span className="text-gray-700 font-medium">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
