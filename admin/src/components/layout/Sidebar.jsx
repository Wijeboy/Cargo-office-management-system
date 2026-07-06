import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PackageOpen,
  PackagePlus,
  PackageMinus,
  Grid3x3,
  AlertTriangle,
  UserCog,
  Settings,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Inventory Management',
    icon: PackageOpen,
    path: '/warehouse/inventory',
  },
  {
    title: 'Incoming Cargo',
    icon: PackagePlus,
    path: '/warehouse/incoming',
  },
  {
    title: 'Outgoing Cargo',
    icon: PackageMinus,
    path: '/warehouse/outgoing',
  },
  {
    title: 'Storage Allocation',
    icon: Grid3x3,
    path: '/warehouse/storage',
  },
  {
    title: 'Damage/Lost Report',
    icon: AlertTriangle,
    path: '/warehouse/damage-reports',
  },
  {
    title: 'User Management',
    icon: UserCog,
    path: '/admin/users',
  },
  {
    title: 'System Settings',
    icon: Settings,
    path: '/settings',
  },
]

export default function Sidebar({ isOpen }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Package className="w-8 h-8 text-primary-600" />
          <span className="ml-3 text-xl font-bold text-gray-800">LogiFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3 text-sm font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}