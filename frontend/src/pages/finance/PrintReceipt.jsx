import React, { useState, useEffect } from 'react';
import SuccessBanner from '../../components/receipt/SuccessBanner';
import InvoiceCard from '../../components/receipt/InvoiceCard';
import NextSteps from '../../components/receipt/NextSteps';
import AuditSummary from '../../components/receipt/AuditSummary';
import SecureLedgerCard from '../../components/receipt/SecureLedgerCard';

const PrintReceipt = ({ invoice: initialInvoice, onNavigate }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      let searchKey = null;
      let isNo = false;

      if (typeof initialInvoice === 'string') {
        searchKey = initialInvoice;
        isNo = initialInvoice.startsWith('INV-');
      } else if (initialInvoice && typeof initialInvoice === 'object') {
        if (initialInvoice.id) {
          searchKey = initialInvoice.id;
          isNo = false;
        } else if (initialInvoice.invoiceNo) {
          searchKey = initialInvoice.invoiceNo;
          isNo = true;
        }
      }

      if (!searchKey) {
        setInvoice(initialInvoice || {});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('lf_token');
        const url = isNo 
          ? `http://localhost:5001/api/invoices/no/${searchKey}`
          : `http://localhost:5001/api/invoices/${searchKey}`;
          
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load invoice details from database.');
        }

        const data = await response.json();
        setInvoice(data.invoice);
      } catch (err) {
        console.error(err);
        setError(err.message);
        // Fallback to initialInvoice if API call fails
        setInvoice(initialInvoice && typeof initialInvoice === 'object' ? initialInvoice : {});
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [initialInvoice]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-3xl text-indigo-600">progress_activity</span>
          <p className="text-gray-500 font-medium text-sm">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error && !invoice?.invoiceNo) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
        <h2 className="text-lg font-bold text-rose-600 mb-2">Error Loading Invoice</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          onClick={() => onNavigate('invoices')}
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const invoiceData = invoice || {};

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Styles for clean printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide everything except the print-area container */
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          /* Hide non-printable page layout elements */
          aside, header, footer, .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Top Banner (hidden during printing) */}
      <div className="no-print">
        <SuccessBanner invoiceNumber={invoiceData.invoiceNo || "INV-1043"} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Invoice Details (Printable) */}
        <div className="lg:col-span-2 print-area">
          <InvoiceCard invoice={invoiceData} />
        </div>

        {/* Right Column: Actions & Sidebar Info (hidden during printing) */}
        <div className="space-y-6 no-print">
          <NextSteps />
          <AuditSummary />
          <SecureLedgerCard />
          <button
            className="w-full bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>
          <button
            className="w-full bg-[#0b192c] text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition"
            onClick={() => onNavigate('invoices')}
          >
            Back to invoices
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;
