import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth pages
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";
import CustomerServiceLayout from "./components/layout/CustomerServiceLayout";
import CustomerPortalLayout from "./components/layout/CustomerPortalLayout";

// App pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TrackCargo from "./pages/cargo/TrackCargo";
import CargoList from "./pages/cargo/CargoList";
import CustomerList from "./pages/customers/CustomerList";
import CustomerRegistration from "./pages/customers/CustomerRegistration";
import InquiryManagement from "./pages/customers/InquiryManagement";
import ComplaintManagement from "./pages/customers/ComplaintManagement";
import FeedbackManagement from "./pages/customers/FeedbackManagement";
import NotificationManagement from "./pages/customers/NotificationManagement";
import CustomerPortalDashboard from "./pages/customers/CustomerPortalDashboard";
import InvoiceList from "./pages/finance/InvoiceList";
import WarehouseList from "./pages/warehouse/WarehouseList";
import UserList from "./pages/users/UserList";
import MyProfile from "./pages/profile/MyProfile";
import NotFound from "./pages/NotFound";
import PublicTrackCargo from "./pages/public/PublicTrackCargo";

// Protected route using the original Admin layout
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// Protected route using the Customer Service layout
function CustomerServiceProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CustomerServiceLayout>
      {children}
    </CustomerServiceLayout>
  );
}

function CustomerPortalProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CustomerPortalLayout>
      {children}
    </CustomerPortalLayout>
  );
}

// Public route
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// App routes
function AppRoutes() {
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

      {/* Existing protected Admin routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cargo"
        element={
          <ProtectedRoute>
            <CargoList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/track"
        element={
          <ProtectedRoute>
            <TrackCargo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoiceList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouse"
        element={
          <ProtectedRoute>
            <WarehouseList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* Customer Service route */}
      <Route
        path="/customers"
        element={
          <CustomerServiceProtectedRoute>
            <CustomerList />
          </CustomerServiceProtectedRoute>
        }
      />

      <Route
        path="/customers/register"
        element={
          <CustomerServiceProtectedRoute>
            <CustomerRegistration />
          </CustomerServiceProtectedRoute>
         }
      />

      <Route
        path="/customer-service/inquiries"
        element={
          <CustomerServiceProtectedRoute>
            <InquiryManagement />
          </CustomerServiceProtectedRoute>
         }
      />

      <Route
        path="/customer-service/complaints"
        element={
          <CustomerServiceProtectedRoute>
            <ComplaintManagement />
          </CustomerServiceProtectedRoute>
        }
     />

      <Route
        path="/customer-service/feedback"
        element={
          <CustomerServiceProtectedRoute>
            <FeedbackManagement />
          </CustomerServiceProtectedRoute>
        }
    />

      <Route
        path="/customer-service/notifications"
        element={
          <CustomerServiceProtectedRoute>
            <NotificationManagement />
          </CustomerServiceProtectedRoute>
         }
    />

      <Route
        path="/customer-portal/dashboard"
        element={
          <CustomerPortalProtectedRoute>
            <CustomerPortalDashboard />
          </CustomerPortalProtectedRoute>
         }
    />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/track-parcel" replace />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Root app
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}