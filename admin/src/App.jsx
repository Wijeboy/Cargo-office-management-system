import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import IncomingCargo from './pages/IncomingCargo'
import OutgoingCargo from './pages/OutgoingCargo'
import StorageAllocation from './pages/StorageAllocation'
import DamageReport from './pages/DamageReport'
import Users from './pages/Users'
import Settings from './pages/SystemSettings'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/warehouse" element={<Inventory />} />
        <Route path="/warehouse/inventory" element={<Navigate to="/warehouse" replace />} />
        <Route path="/warehouse/incoming" element={<IncomingCargo />} />
        <Route path="/warehouse/outgoing" element={<OutgoingCargo />} />
        <Route path="/warehouse/storage" element={<StorageAllocation />} />
        <Route path="/warehouse/damage-reports" element={<DamageReport />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
