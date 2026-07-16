import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutGrid,
  FileText,
  CreditCard,
  Wallet,
  BarChart3,
  LifeBuoy,
  LogOut,
} from "lucide-react";

// Each entry's `match` array lists every page key that should highlight it
const navItems = [
  { key: "dashboard", label: "Finance Dashboard", icon: LayoutGrid, match: ["dashboard"] },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-200">
        <img src="./public/logo.png" alt="LogiFlow logo" className="w-8 h-8 object-contain" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">LogiFlow</p>
        </div>
      </div>

      <div className="px-5 pt-3 pb-1">
        <p className="text-xs text-gray-400">Logistics Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto">
        <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-gray-400">
          FINANCE
        </p>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors mt-0.5 ${
              item.match.includes(activePage)
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-gray-200 pt-3 space-y-1">
        <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <LifeBuoy className="w-4 h-4" />
          Support
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
