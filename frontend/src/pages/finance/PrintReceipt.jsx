import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import SuccessBanner from '../../components/receipt/SuccessBanner';
import InvoiceCard from '../../components/receipt/InvoiceCard';
import NextSteps from '../../components/receipt/NextSteps';
import AuditSummary from '../../components/receipt/AuditSummary';
import SecureLedgerCard from '../../components/receipt/SecureLedgerCard';

const PrintReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state || {};

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Top Banner */}
      <SuccessBanner invoiceNumber={invoice.invoiceNo || "INV-1043"} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Invoice Details */}
        <div className="lg:col-span-2">
          <InvoiceCard invoice={invoice} />
        </div>

        {/* Right Column: Actions & Sidebar Info */}
        <div className="space-y-6">
          <NextSteps />
          <AuditSummary />
          <SecureLedgerCard />
          <button
            className="w-full bg-[#0b192c] text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition"
            onClick={() => navigate('/invoices')}
          >
            Back to invoices
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;
