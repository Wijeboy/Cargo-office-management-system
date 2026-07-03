import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard layout
import DashboardLayout from './components/layout/DashboardLayout';

// App pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TrackCargo from './pages/cargo/TrackCargo';
import CargoList from './pages/cargo/CargoList';
import CustomerList from './pages/customers/CustomerList';
import InvoiceList from './pages/finance/InvoiceList';
import WarehouseList from './pages/warehouse/WarehouseList';
import UserList from './pages/users/UserList';
import MyProfile from './pages/profile/MyProfile';
import NotFound from './pages/NotFound';
import CreateBooking from './pages/cargo/CreateBooking';
import ShipmentScheduling from './pages/scheduling/ShipmentScheduling';
import RouteManagement from './pages/routes/RouteManagement';
import OperationsReports from './pages/reports/OperationsReports';
import ShipmentHistory from './pages/history/ShipmentHistory';
import PublicTrackCargo from './pages/public/PublicTrackCargo';

// ─── Protected Route wrapper ──────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

// ─── Public Route (redirect if already logged in) ─────────
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ─── App Routes ───────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Fully public routes (no auth required, ever) */}
      <Route path="/track-parcel" element={<PublicTrackCargo />} />
      <Route path="/not-found" element={<NotFound />} />

      {/* Public auth routes (redirect to dashboard if already logged in) */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/cargo" element={<ProtectedRoute><CargoList /></ProtectedRoute>} />
      <Route path="/cargo/new" element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />
      <Route path="/scheduling" element={<ProtectedRoute><ShipmentScheduling /></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute><TrackCargo /></ProtectedRoute>} />
      <Route path="/routes" element={<ProtectedRoute><RouteManagement /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><OperationsReports /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><ShipmentHistory /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
      <Route path="/warehouse" element={<ProtectedRoute><WarehouseList /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/track-parcel" replace />} />

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
      </AuthProvider>
    </BrowserRouter>
  );
}
