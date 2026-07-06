import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function AddExpense({ onNavigate }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Expense of ${amount || "$0"} for "${category || "uncategorized"}" saved`);
    onNavigate("expenses");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => onNavigate("expenses")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Financial Reports
      </button>

      <div className="mb-6">
        <p className="text-xs text-gray-400">Finance / Expenses / New</p>
        <h1 className="text-xl font-semibold text-gray-900">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            <option>Fuel</option>
            <option>Salaries</option>
            <option>Maintenance</option>
            <option>Utilities</option>
            <option>Office</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount (USD)</label>
            <input
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0.00"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Shell Fleet"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Approved by</label>
          <input
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="Manager name"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Receipt</label>
          <div className="border border-dashed border-gray-300 rounded-lg px-3 py-6 text-center text-xs text-gray-400">
            Drag a receipt here, or click to upload
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onNavigate("expenses")}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            Save expense
          </button>
        </div>
      </form>
    </div>
  );
}
