import { Link, useLocation } from 'react-router-dom'
import {
  AlertTriangle, Boxes, Grid3X3, LayoutDashboard, Package,
  PackageMinus, PackagePlus, Settings, UserCog, X,
} from 'lucide-react'

const navigation = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/warehouse', 'Warehouse Log', Package],
  ['/warehouse/incoming', 'Incoming Cargo', PackagePlus],
  ['/warehouse/outgoing', 'Outgoing Cargo', PackageMinus],
  ['/warehouse/storage', 'Storage Allocation', Grid3X3],
  ['/warehouse/damage-reports', 'Damage/Lost Report', AlertTriangle],
  ['/admin/users', 'User Management', UserCog],
  ['/settings', 'System Settings', Settings],
]

export default function AdminSidebar({ open, onClose }) {
  const { pathname } = useLocation()

  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
      <div className="brand">
        <span className="brand-mark"><Boxes size={17} /></span>
        <strong>LogiFlow</strong>
        <button className="sidebar-close" onClick={onClose} aria-label="Close navigation"><X /></button>
      </div>
      <nav>
        {navigation.map(([path, label, Icon]) => (
          <Link className={pathname === path ? 'active' : ''} to={path} onClick={onClose} key={path}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <footer>© 2024 LogiFlow Systems Inc.</footer>
    </aside>
  )
}
