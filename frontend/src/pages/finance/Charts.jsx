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

const fallbackRevenueData = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 0 },
  { month: "Mar", revenue: 0 },
  { month: "Apr", revenue: 0 },
  { month: "May", revenue: 0 },
  { month: "Jun", revenue: 0 },
];

// `data` is the API's monthlyRevenueTrend: [{ month: "2026-07", revenue: 23763 }, ...]
export function RevenueExpensesChart({ data }) {
  const chartData = data && data.length > 0 ? data : fallbackRevenueData;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 lg:col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Revenue Trend</p>
          <p className="text-xs text-gray-400">Last 6 months</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Revenue
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
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
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#818CF8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const statusColors = {
  PAID: "#6366F1",
  PARTIALLY_PAID: "#FDBA74",
  PENDING: "#5EEAD4",
  OVERDUE: "#FDA4AF",
};

// `data` is the API's invoiceStatusBreakdown: { PAID: 1, PARTIALLY_PAID: 1, ... }
export function InvoiceStatusChart({ data }) {
  const entries = data && Object.keys(data).length > 0 ? Object.entries(data) : [["No data", 1]];
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const chartData = entries.map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || "#CBD5E1",
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">Invoice Status</p>

      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, i) => (
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
        {chartData.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </span>
            <span className="text-gray-700 font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
