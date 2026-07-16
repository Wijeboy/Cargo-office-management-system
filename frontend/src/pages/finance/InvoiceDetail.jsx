import React, { useMemo, useState } from "react";
import { ArrowLeft, Printer, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function InvoiceDetail({ invoice, selectedPayment, onNavigate }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState(invoice?.totalAmount || "");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  const status = (invoice?.paymentStatus || "PENDING").toUpperCase();
  const subtotal = useMemo(() => Number(invoice?.subtotal ?? ((invoice?.totalAmount || 0) - (invoice?.tax || 0))), [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("lf_token");
      const response = await fetch("http://localhost:5001/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: invoice?.id,
          amount: Number(amount),
          method,
          reference: reference || null,
          paidBy: paidBy || null,
          paymentDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to record payment.");
      }

      toast.success("Payment recorded successfully.");
      onNavigate("print-receipt", { invoice: { ...invoice, paymentStatus: "PAID" }, payment: data.payment });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => onNavigate("invoices")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Invoice Management
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Finance / Invoices / Detail</p>
            <h1 className="text-2xl font-semibold text-gray-900">{invoice?.invoiceNo || "Invoice Detail"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Customer: {invoice?.customer?.name || "N/A"}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {status}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <InfoCard label="Invoice Date" value={invoice?.date ? new Date(invoice.date).toLocaleDateString() : "N/A"} />
          <InfoCard label="Total Amount" value={money(invoice?.totalAmount)} />
          <InfoCard label="Balance Due" value={money(Math.max((invoice?.totalAmount || 0) - Number(selectedPayment?.amount || 0), 0))} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Invoice Summary</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Subtotal" value={money(subtotal)} />
              <Row label="Tax" value={money(invoice?.tax)} />
              <Row label="Grand Total" value={money(invoice?.totalAmount)} />
              <Row label="Customer" value={invoice?.customer?.company || invoice?.customer?.name || "N/A"} />
            </dl>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
            {status !== "PAID" ? (
              <>
                <p className="text-sm text-gray-500 mb-4">Record a payment against this invoice to enable receipt printing.</p>
                <button
                  onClick={() => setShowPaymentForm((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate("print-receipt", { invoice, payment: selectedPayment })}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            )}
          </div>
        </div>

        {showPaymentForm && status !== "PAID" && (
          <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-5 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reference</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Paid By</label>
              <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowPaymentForm(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white">
                Save Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900 text-right">{value}</dd>
    </div>
  );
}
