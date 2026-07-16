import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Send } from "lucide-react";
import { getInvoiceFormOptions, createInvoice } from "../../api/financeApi";

const emptyLine = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  description: "",
  qty: 1,
  rate: 0,
});

export default function GenerateInvoice({ onNavigate }) {
  const [shipmentId, setShipmentId] = useState("");
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const [issueDate, setIssueDate] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(8);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getInvoiceFormOptions()
      .then((res) => {
        if (isMounted) {
          setShipments(res.shipments || []);
          setCustomers(res.customers || []);
        }
      })
      .catch((err) => {
        if (isMounted) setOptionsError(err.message);
      })
      .finally(() => {
        if (isMounted) setOptionsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedShipment = shipments.find((s) => s.id === shipmentId);
  const selectedCustomer = customers.find((c) => c.id === selectedShipment?.customerId);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!shipmentId || !selectedShipment) {
      setSubmitError("Please select a shipment.");
      return;
    }

    setSubmitting(true);
    try {
      // Store the line-item breakdown as JSON in `notes`, matching the
      // convention already used by seeded invoices in the backend.
      const lineItemsJson = JSON.stringify(
        lines.map((l) => ({
          title: l.description,
          quantity: Number(l.qty) || 0,
          rate: Number(l.rate) || 0,
          amount: (Number(l.qty) || 0) * (Number(l.rate) || 0),
        }))
      );

      await createInvoice({
        shipmentId,
        customerId: selectedShipment.customerId,
        subtotal,
        taxRate: Number(taxRate) / 100,
        date: issueDate || undefined,
        notes: notes ? `${notes}\n${lineItemsJson}` : lineItemsJson,
      });

      onNavigate("invoices");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
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
      </div>

      {optionsError && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2 mb-4">
          Failed to load customers/shipments: {optionsError}
        </div>
      )}
      {submitError && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2 mb-4">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipment + customer + date */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Shipment
            </label>
            <select
              required
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              disabled={optionsLoading}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                {optionsLoading ? "Loading shipments..." : "Select a shipment"}
              </option>
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shipmentCode} — {s.origin} → {s.destination}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Client (from shipment)
            </label>
            <input
              readOnly
              value={selectedCustomer?.name || ""}
              placeholder="Select a shipment first"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Issue date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
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
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Generating..." : "Generate invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
