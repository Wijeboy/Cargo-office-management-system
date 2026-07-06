import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white text-xs text-gray-400">
      <p>&copy; {year} LogiFlow Logistics Systems</p>
      <div className="flex items-center gap-5">
        <a href="#" className="hover:text-gray-600 transition-colors">
          Support Center
        </a>
        <a href="#" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-gray-600 transition-colors">
          Terms of Service
        </a>
      </div>
    </footer>
  );
}
