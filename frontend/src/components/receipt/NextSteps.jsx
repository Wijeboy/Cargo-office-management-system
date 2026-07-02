import React from 'react'
import { Mail, ArrowLeft, History } from "lucide-react";

const NextSteps = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Next Steps
      </h3>
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-left group">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Email to Client
              </p>
              <p className="text-[11px] text-gray-400">
                Send as PDF attachment
              </p>
            </div>
          </div>
          <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </button>

        <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-left group">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <History size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                View History
              </p>
              <p className="text-[11px] text-gray-400">Track audit changes</p>
            </div>
          </div>
          <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </button>

        <button className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition">
          <ArrowLeft size={14} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NextSteps
