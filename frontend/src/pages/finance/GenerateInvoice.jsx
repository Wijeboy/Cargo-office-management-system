import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, Send, Save } from "lucide-react";
import { toast } from "react-hot-toast";


const emptyLine = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  description: "",
  qty: 1,
  rate: 0,
});

export default function GenerateInvoice({ onNavigate }) {
  const [client, setClient] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(8);

  const updateLine = (id, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (id) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));

  const subtotal = lines.reduce(
    (sum, l) => sum + (Number(l.qty) || 0) * (Number(l.rate) || 0),
    0
  );
  const tax = subtotal * (Number(taxRate) / 100 || 0);
  const total = subtotal + tax;

  const currency = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const invoiceNumber = `INV-${Date.now().toString().slice(-4)}`;
    const invoice = {
      id: `tmp-${Date.now()}`,
      invoiceNo: invoiceNumber,
      paymentStatus: "PENDING",
      date: issueDate,
      dueDate,
      notes,
      tax,
      totalAmount: total,
      subtotal,
    };
    // Show premium toast notification
    toast.success(`Invoice ${invoiceNumber} for ${client || "Client"} generated successfully!`);
    // Navigate to invoice detail subpage so payment is recorded before receipt printing
    onNavigate("invoice-detail", { invoice });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back + heading */}
      <button
        onClick={() => onNavigate("invoices")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Invoice Management
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-gray-400">Finance / Invoices / New</p>
          <h1 className="text-xl font-semibold text-gray-900">Generate Invoice</h1>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
          Draft
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client + dates */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Client name
            </label>
            <input
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Apex Manufacturing"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Issue date
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Due date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Line items</p>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {lines.map((line) => (
              <div
                key={line.id}
                className="grid grid-cols-12 gap-3 items-center px-5 py-3"
              >
                <input
                  value={line.description}
                  onChange={(e) => updateLine(line.id, "description", e.target.value)}
                  placeholder="Item description"
                  className="col-span-12 sm:col-span-6 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  min="0"
                  value={line.qty}
                  onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                  placeholder="Qty"
                  className="col-span-4 sm:col-span-2 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.rate}
                  onChange={(e) => updateLine(line.id, "rate", e.target.value)}
                  placeholder="Rate"
                  className="col-span-5 sm:col-span-3 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="col-span-3 sm:col-span-1 flex items-center justify-center text-gray-400 hover:text-rose-600"
                  aria-label="Remove line item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes + totals */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Payment terms, thank-you note, etc."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">{currency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500 flex items-center gap-2">
                Tax
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-14 px-1.5 py-0.5 text-xs rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                %
              </span>
              <span className="text-gray-900 font-medium">{currency(tax)}</span>
            </div>
            <div className="flex items-center justify-between text-base border-t border-gray-100 pt-3 mt-3">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-gray-900">{currency(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onNavigate("invoices")}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Save className="w-4 h-4" />
            Save draft
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            <Send className="w-4 h-4" />
            Generate & send
          </button>
        </div>
      </form>
    </div>
  );
}
