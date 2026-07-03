import React, { useState } from "react";
import Sidebar from "./pages/finance/Sidebar";
import Topbar from "./pages/finance/Topbar";
import Footer from "./pages/finance/Footer";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import InvoiceManagement from "./pages/finance/InvoiceManagement";
import GenerateInvoice from "./pages/finance/GenerateInvoice";
import PaymentManagement from "./pages/finance/PaymentManagement";
import ExpenseManagement from "./pages/finance/ExpenseManagement";
import AddExpense from "./pages/finance/AddExpense";
import FinancialReports from "./pages/finance/FinancialReports";

/**
 * Simple state-based "router". Swap this for react-router-dom if the
 * rest of your app already uses it — just replace `page`/`setPage`
 * with useNavigate()/useParams() and turn each case below into a <Route>.
 *
 * Page keys:
 *  dashboard     -> Finance Dashboard
 *  invoices      -> Invoice Management
 *  invoice-form  -> Generate Invoice
 *  payments      -> Payment Management
 *  expenses      -> Expense Management (Financial Reports-style expense view)
 *  add-expense   -> Add Expense form
 *  reports       -> Financial Reports
 */
export default function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "invoices":
        return <InvoiceManagement onNavigate={setPage} />;
      case "invoice-form":
        return <GenerateInvoice onNavigate={setPage} />;
      case "payments":
        return <PaymentManagement onNavigate={setPage} />;
      case "expenses":
        return <ExpenseManagement onNavigate={setPage} />;
      case "add-expense":
        return <AddExpense onNavigate={setPage} />;
      case "reports":
        return <FinancialReports onNavigate={setPage} />;
      case "dashboard":
      default:
        return <FinanceDashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Topbar />
        <div className="flex-1">{renderPage()}</div>
        <Footer />
      </div>
    </div>
  );
}
