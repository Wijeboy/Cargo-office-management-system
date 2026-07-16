import React from "react";
import { Search, Bell, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Topbar() {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FI';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="relative w-80 max-w-full">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search invoice, payment..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          aria-label="Settings"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="User avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white uppercase">
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
