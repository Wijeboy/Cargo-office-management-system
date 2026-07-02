import React from 'react'
import { mockAuditTrail } from '../../data/mockData';

const AuditSummary = () => {

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Audit Summary
      </h3>
      <div className="relative pl-4 space-y-6 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-50">
        {mockAuditTrail.map((update, idx) => (
          <div key={idx} className="relative flex flex-col gap-0.5">
            {/* Timeline node */}
            <div
              className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ring-4 ${update.current ? "bg-emerald-500 ring-emerald-100" : "bg-blue-300 ring-blue-50"}`}
            />
            <span className="text-[10px] text-gray-400 font-medium">
              {update.time}
            </span>
            <p className="text-xs font-bold text-gray-800">{update.title}</p>
            <p className="text-xs text-gray-500">{update.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditSummary