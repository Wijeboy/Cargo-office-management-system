import React from "react";
import { ArrowUpRight } from "lucide-react";

/** Top row: quick-link cards (Invoice Management, Payment Management, etc.) */
export function QuickLinkCard({ icon: Icon, title, onOpen }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-6 hover:shadow-sm transition-shadow">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <button
          onClick={onOpen}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
        >
          Open <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/** Second row: stat cards with icon chip + trend badge (Total Revenue, etc.) */
export function StatCard({ icon: Icon, iconBg, iconColor, trend, trendUp, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendUp
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
