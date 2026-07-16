import React, { useEffect, useState } from "react";
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
import { getDashboard } from "../../api/financeApi";

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function FinanceDashboard({ onNavigate }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getDashboard()
      .then((res) => {
        if (isMounted) setDashboard(res.dashboard);
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

  const totals = dashboard?.totals;

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
          <button
            onClick={() => onNavigate("invoice-form")}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2">
          Failed to load dashboard: {error}
        </div>
      )}

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
          label="Total Revenue"
          value={loading ? "…" : currency(totals?.totalRevenue)}
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Outstanding Invoices"
          value={loading ? "…" : currency(totals?.totalOutstanding)}
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Total Expenses"
          value={loading ? "…" : currency(totals?.totalExpenses)}
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Net Profit"
          value={loading ? "…" : currency(totals?.netProfit)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueExpensesChart data={dashboard?.monthlyRevenueTrend} />
        <InvoiceStatusChart data={dashboard?.invoiceStatusBreakdown} />
      </div>

      {/* Transactions */}
<TransactionsTable payments={dashboard?.recentPayments} onNavigate={onNavigate} />
    </div>
  );
}
