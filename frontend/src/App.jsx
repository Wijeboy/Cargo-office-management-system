import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";


// Auth pages
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";
import CustomerServiceLayout from "./components/layout/CustomerServiceLayout";
import CustomerPortalLayout from "./components/layout/CustomerPortalLayout";

// Operations & Cargo pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CargoList from "./pages/cargo/CargoList";
import CreateBooking from "./pages/cargo/CreateBooking";
import ShipmentScheduling from "./pages/cargo/ShipmentScheduling";
import TrackCargo from "./pages/cargo/cargotracking";
import RouteManagement from "./pages/cargo/RouteManagement";
import OperationsReports from "./pages/cargo/OperationsReports";
import ShipmentHistory from "./pages/cargo/ShipmentHistory";

// Customer Service pages
import CustomerPortalDashboard from "./pages/customers/CustomerPortalDashboard";
import CustomerList from "./pages/customers/CustomerList";
import InquiryManagement from "./pages/customers/InquiryManagement";
import ComplaintManagement from "./pages/customers/ComplaintManagement";
import FeedbackManagement from "./pages/customers/FeedbackManagement";
import NotificationManagement from "./pages/customers/NotificationManagement";
import CustomerRegistration from "./pages/customers/CustomerRegistration";

// Finance pages & Layout components
import Sidebar from "./pages/finance/Sidebar";
import Topbar from "./pages/finance/Topbar";
import Footer from "./pages/finance/Footer";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import InvoiceManagement from "./pages/finance/InvoiceManagement";
import GenerateInvoice from "./pages/finance/GenerateInvoice";
import InvoiceDetail from "./pages/finance/InvoiceDetail";
import PaymentManagement from "./pages/finance/PaymentManagement";
import ExpenseManagement from "./pages/finance/ExpenseManagement";
import AddExpense from "./pages/finance/AddExpense";
import FinancialReports from "./pages/finance/FinancialReports";
import PrintReceipt from "./pages/finance/PrintReceipt";


// Other pages
import UserList from "./pages/users/UserList";
import MyProfile from "./pages/profile/MyProfile";
import PublicTrackCargo from "./pages/public/PublicTrackCargo";
import NotFound from "./pages/NotFound";
import AdminInventory from "../../admin/src/pages/Inventory";
import AdminIncomingCargo from "../../admin/src/pages/IncomingCargo";
import AdminOutgoingCargo from "../../admin/src/pages/OutgoingCargo";
import AdminStorageAllocation from "../../admin/src/pages/StorageAllocation";
import AdminDamageReport from "../../admin/src/pages/DamageReport";
import "../../admin/src/styles/admin.css";

// ─── Route Guards ─────────────────────────────────────────

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="material-symbols-outlined animate-spin text-3xl text-sky-500">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "FINANCE") {
      return <Navigate to="/finance" replace />;
    }

    if (user?.role === "CUSTOMER_SERVICE") {
      return <Navigate to="/customers" replace />;
    }

    if (user?.role === "CUSTOMER") {
      return <Navigate to="/customer-portal/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    if (user?.role === "FINANCE") {
      return <Navigate to="/finance" replace />;
    }

    if (user?.role === "CUSTOMER_SERVICE") {
      return <Navigate to="/customers" replace />;
    }

    if (user?.role === "CUSTOMER") {
      return <Navigate to="/customer-portal/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="material-symbols-outlined animate-spin text-3xl text-sky-500">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "FINANCE") {
    return <Navigate to="/finance" replace />;
  }

  if (user?.role === "CUSTOMER_SERVICE") {
    return <Navigate to="/customers" replace />;
  }

  if (user?.role === "CUSTOMER") {
    return <Navigate to="/customer-portal/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

// ─── Finance Portal component ──────────────────────────────

function FinancePortal() {
  const [page, setPage] = useState("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const navigateTo = (nextPage, payload = null) => {
    if (payload?.invoice) {
      setSelectedInvoice(payload.invoice);
    } else if (payload && (payload.id || payload.invoiceNo)) {
      setSelectedInvoice(payload);
    }
    if (payload?.payment) {
      setSelectedPayment(payload.payment);
    } else if (payload?.selectedPayment) {
      setSelectedPayment(payload.selectedPayment);
    }
    setPage(nextPage);
  };

  const renderPage = () => {
    switch (page) {
      case "invoices":
        return <InvoiceManagement onNavigate={navigateTo} />;
      case "invoice-form":
        return <GenerateInvoice onNavigate={navigateTo} />;
      case "invoice-detail":
        return <InvoiceDetail invoice={selectedInvoice} selectedPayment={selectedPayment} onNavigate={navigateTo} />;
      case "print-receipt":
        return <PrintReceipt invoice={selectedInvoice} payment={selectedPayment} onNavigate={navigateTo} />;
      case "payments":
        return <PaymentManagement onNavigate={navigateTo} />;
      case "expenses":
        return <ExpenseManagement onNavigate={navigateTo} />;
      case "add-expense":
        return <AddExpense onNavigate={navigateTo} />;
      case "reports":
        return <FinancialReports onNavigate={navigateTo} />;

      case "dashboard":
      default:
        return <FinanceDashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans w-full">
      <Sidebar activePage={page} onNavigate={navigateTo} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        <Topbar />

        <div className="flex-1">{renderPage()}</div>

        <Footer />
      </div>
    </div>
  );
}

// ─── Profile Layout Wrapper ──────────────────────────────

function ProfileLayoutWrapper({ children }) {
  const { user } = useAuth();

  if (user?.role === "FINANCE") {
    return (
      <div className="flex min-h-screen w-full bg-gray-50 font-sans text-gray-900">
        <Sidebar activePage="" onNavigate={() => {}} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />

          <div className="flex-1 p-6">{children}</div>

          <Footer />
        </div>
      </div>
    );
  }

  if (user?.role === "CUSTOMER_SERVICE") {
    return <CustomerServiceLayout>{children}</CustomerServiceLayout>;
  }

  if (user?.role === "CUSTOMER") {
    return <CustomerPortalLayout>{children}</CustomerPortalLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// ─── App Routes ───────────────────────────────────────────

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-sky-500">
            progress_activity
          </span>

          <p className="text-sm font-medium text-slate-500">
            Initializing LogiFlow...
          </p>
        </div>
      </div>
    );
  }

  const customerRegistrationElement = (
    <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER_SERVICE"]}>
      <CustomerServiceLayout>
        <CustomerRegistration />
      </CustomerServiceLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* Fully public routes */}
      <Route path="/track-parcel" element={<PublicTrackCargo />} />
      <Route path="/not-found" element={<NotFound />} />

      {/* Public authentication routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected Operations & Admin routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/cargo" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><CargoList /></DashboardLayout></ProtectedRoute>} />
      <Route path="/cargo/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><CreateBooking /></DashboardLayout></ProtectedRoute>} />
      <Route path="/scheduling" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><ShipmentScheduling /></DashboardLayout></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><TrackCargo /></DashboardLayout></ProtectedRoute>} />
      <Route path="/routes" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><RouteManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><OperationsReports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS']}><DashboardLayout><ShipmentHistory /></DashboardLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout><UserList /></DashboardLayout></ProtectedRoute>} />
      <Route path="/warehouse" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><DashboardLayout><AdminInventory /></DashboardLayout></ProtectedRoute>} />
      <Route path="/warehouse/inventory" element={<Navigate to="/warehouse" replace />} />
      <Route path="/warehouse/incoming" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><DashboardLayout><AdminIncomingCargo /></DashboardLayout></ProtectedRoute>} />
      <Route path="/warehouse/outgoing" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><DashboardLayout><AdminOutgoingCargo /></DashboardLayout></ProtectedRoute>} />
      <Route path="/warehouse/storage" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><DashboardLayout><AdminStorageAllocation /></DashboardLayout></ProtectedRoute>} />
      <Route path="/warehouse/damage-reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><DashboardLayout><AdminDamageReport /></DashboardLayout></ProtectedRoute>} />



      {/* Protected Customer Service routes */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER_SERVICE"]}>
            <CustomerServiceLayout>
              <CustomerList />
            </CustomerServiceLayout>
          </ProtectedRoute>
        }
      />

      {/* Original registration URL */}
      <Route
        path="/customer-service/register"
        element={customerRegistrationElement}
      />

      {/* Additional registration URL */}
      <Route
        path="/customers/register"
        element={customerRegistrationElement}
      />

      <Route
        path="/customer-service/inquiries"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER_SERVICE"]}>
            <CustomerServiceLayout>
              <InquiryManagement />
            </CustomerServiceLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-service/complaints"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER_SERVICE"]}>
            <CustomerServiceLayout>
              <ComplaintManagement />
            </CustomerServiceLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-service/feedback"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER_SERVICE"]}>
            <CustomerServiceLayout>
              <FeedbackManagement />
            </CustomerServiceLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-service/notifications"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER_SERVICE"]}>
            <CustomerServiceLayout>
              <NotificationManagement />
            </CustomerServiceLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Customer Portal routes */}
      <Route
        path="/customer-portal/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <CustomerPortalDashboard />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/shipments"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <CargoList />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/track"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <TrackCargo />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/payments"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <PaymentManagement />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/inquiries"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <InquiryManagement />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/complaints"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <ComplaintManagement />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/notifications"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <NotificationManagement />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer-portal/profile"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CUSTOMER"]}>
            <CustomerPortalLayout>
              <MyProfile />
            </CustomerPortalLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Finance route */}
      <Route
        path="/finance"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "FINANCE"]}>
            <FinancePortal />
          </ProtectedRoute>
        }
      />

      {/* Shared Profile page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileLayoutWrapper>
              <MyProfile />
            </ProfileLayoutWrapper>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
