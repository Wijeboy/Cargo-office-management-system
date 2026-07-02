import React from 'react'
import { CheckCircle2, Download, Printer } from "lucide-react";

const SuccessBanner = ({ invoiceNumber }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm gap-4">
      <div className="flex items-start gap-4">
        <div className="bg-emerald-50 p-2 rounded-full text-emerald-600 flex-shrink-0">
          <CheckCircle2 size={32} className="fill-emerald-50" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Invoice Saved Successfully!
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Confirmation for {invoiceNumber}. All logistics fees and tax
            calculations have been finalized and recorded in the financial
            ledger.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex items-center justify-center gap-2 bg-[#0b192c] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition">
          <Download size={16} /> Download PDF
        </button>
        <button className="flex items-center justify-center gap-2 bg-[#e2ecf9] text-[#1e3a8a] px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-100 transition">
          <Printer size={16} /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default SuccessBanner