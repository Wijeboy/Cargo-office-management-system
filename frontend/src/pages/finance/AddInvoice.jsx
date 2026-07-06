import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddInvoice = ({ onSave, onCancel }) => {
    const navigate = useNavigate();
    const [clientName, setClientName] = useState("");
    const [status, setStatus] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [approvedBy, setApprovedBy] = useState("");
    const [receiptAttached, setReceiptAttached] = useState(false); // false = 'No', true = 'Yes'
    const [subtotal, setSubtotal] = useState("");

    // Derived calculation state
    const [tax, setTax] = useState(0);

    // Automatically calculate 8% tax when subtotal changes
    useEffect(() => {
      const amount = parseFloat(subtotal);
      if (!isNaN(amount)) {
        setTax(amount * 0.08);
      } else {
        setTax(0);
      }
    }, [subtotal]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = {
        invoiceNo: `INV-${Date.now().toString().slice(-4)}`,
        clientName,
        status,
        issueDate,
        dueDate,
        approvedBy,
        receiptAttached: receiptAttached ? "Yes" : "No",
        subtotal: parseFloat(subtotal) || 0,
        tax: tax,
        total: (parseFloat(subtotal) || 0) + tax,
      };
      if (onSave) {
        onSave(formData);
      }
      navigate("/invoices/print", { state: formData });
    };
  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-sm font-sans text-gray-900">
      {/* Header */}
      <h1 className="text-3xl font-bold border-b border-gray-100 pb-5 mb-6">
        Generate Invoice
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Client Name & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">
              Client Name
            </label>
            <select
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-[#f0f2f5] border-none text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition appearance-none cursor-pointer"
            >
              <option value="">Select</option>
              <option value="Apex Manufacturing">Apex Manufacturing</option>
              <option value="LogiFlow Global">LogiFlow Global</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">Status</label>
            <input
              type="text"
              placeholder="0.00"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#f0f2f5] border-none placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>
        </div>

        {/* Row 2: Issue Date & Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-[#f0f2f5] border-none text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#f0f2f5] border-none text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>
        </div>

        {/* Row 3: Approved By & Receipt Attached Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">
              Approved By
            </label>
            <input
              type="text"
              placeholder="Manager name"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              className="w-full bg-[#f0f2f5] border-none placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-800">
              Receipt Attached
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setReceiptAttached(true)}
                className={`py-3 rounded-xl text-sm font-semibold transition ${
                  receiptAttached
                    ? "bg-[#1a191e] text-white"
                    : "bg-[#f0f2f5] text-gray-400 hover:bg-gray-200"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setReceiptAttached(false)}
                className={`py-3 rounded-xl text-sm font-semibold transition ${
                  !receiptAttached
                    ? "bg-[#1a191e] text-white"
                    : "bg-[#f0f2f5] text-gray-400 hover:bg-gray-200"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Subtotal Amount (USD) input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-800">
            Subtotal Amount(USD)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="00.00"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            className="w-full bg-[#f0f2f5] border-none placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          />
        </div>

        {/* Breakdown Panel Box */}
        <div className="bg-[#f0f2f5] rounded-xl p-5 space-y-3 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-gray-700">
              {subtotal ? `$${parseFloat(subtotal).toFixed(2)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax(8%)</span>
            <span className="font-medium text-gray-700">
              {tax > 0 ? `$${tax.toFixed(2)}` : "—"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-[#1a191e] text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-sm"
          >
            Save Invoice
          </button>
          <button
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel();
                return;
              }
              navigate("/invoices");
            }}
            className="bg-[#f0f2f5] text-gray-900 px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInvoice
