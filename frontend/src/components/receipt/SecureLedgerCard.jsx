import React from "react";
import { ShieldCheck } from "lucide-react";

const SecureLedgerCard = () => {
  return (
    <div className="bg-[#0b192c] text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
      <div className="relative z-10">
        <h4 className="text-sm font-bold tracking-wide mb-2">Secure Ledger</h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          All transactions are secured with 256-bit encryption and recorded
          across our global logistics node network.
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 tracking-wider uppercase">
          <ShieldCheck size={14} className="fill-blue-950" /> Verified Logistics
          Hub
        </div>
      </div>

      {/* Decorative vector shield emblem in bottom-right matching the original layout */}
      <div className="absolute right-0 bottom-0 text-slate-800 opacity-20 pointer-events-none transform translate-x-4 translate-y-4">
        <ShieldCheck size={120} strokeWidth={1} />
      </div>
    </div>
  );
};

export default SecureLedgerCard;
