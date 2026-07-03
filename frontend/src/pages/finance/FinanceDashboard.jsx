import React from "react";
import {
  FileText,
  CreditCard,
  Wallet,
  BarChart3,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
} from "lucide-react";
import { QuickLinkCard, StatCard } from "./Cards";
import { RevenueExpensesChart, InvoiceStatusChart } from "./Charts";
import TransactionsTable from "./TransactionsTable";

export default function FinanceDashboard({ onNavigate }) {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb + heading + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Finance / Overview</p>
          <h1 className="text-xl font-semibold text-gray-900">Finance Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          {/* Quick actions available right from the dashboard */}
                    <button
            onClick={() => onNavigate("invoice-form")}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Quick link cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLinkCard icon={FileText} title="Invoice Management" onOpen={() => onNavigate("invoices")} />
        <QuickLinkCard icon={CreditCard} title="Payment Management" onOpen={() => onNavigate("payments")} />
        <QuickLinkCard icon={Wallet} title="Expense Management" onOpen={() => onNavigate("expenses")} />
        <QuickLinkCard icon={BarChart3} title="Financial Reports" onOpen={() => onNavigate("reports")} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Landmark}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          trend="+12.5%"
          trendUp
          label="Total Revenue"
          value="12,450"
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          trend="-2.4%"
          trendUp={false}
          label="Outstanding Invoices"
          value="$642k"
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend="+5.7%"
          trendUp
          label="Total Expenses"
          value="$88,430"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          trend="+18.2%"
          trendUp
          label="Net Profit"
          value="$188,490"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueExpensesChart />
        <InvoiceStatusChart />
      </div>

      {/* Transactions */}
      <TransactionsTable />
    </div>
  );
}
