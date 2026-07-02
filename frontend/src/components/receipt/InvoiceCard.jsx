import React from 'react'
import { mockReceiptItems } from '../../data/mockData';

const InvoiceCard = ({ invoice }) => {
  const clientName = invoice?.clientName || 'Apex Manufacturing';
  const status = invoice?.status || 'Paid';
  const issueDate = invoice?.issueDate
    ? new Date(invoice.issueDate).toLocaleDateString()
    : 'Oct 24, 2023';
  const dueDate = invoice?.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString()
    : 'Nov 24, 2023';
  const subtotal = invoice?.subtotal ?? 18400;
  const tax = invoice?.tax ?? 1363;
  const total = invoice?.total ?? subtotal + tax;
  const invoiceNo = invoice?.invoiceNo || 'INV-1043';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header Banner */}
      <div className="bg-[#0b192c] text-white p-6 flex justify-between items-start">
        <div>
          <h2 className="font-extrabold tracking-wider text-sm">LOGIFLOW</h2>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide">
            GLOBAL LOGISTICS SOLUTIONS
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            RECEIPT
          </p>
            <p className="text-sm font-semibold text-gray-200">#{invoiceNo}</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-100 text-sm">
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
            Client Billing
          </h3>
          <p className="font-bold text-gray-900">{clientName}</p>
          <p className="text-gray-500 text-xs mt-1">
            451 Industrial Parkway
            <br />
            Detroit, MI 48201
          </p>
          <p className="text-gray-500 text-xs mt-1">contact@apexmf.com</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
            Transaction Info
          </h3>
          <div className="mb-2">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {status}
            </span>{" "}
            <span className="text-gray-500 text-xs ml-1">Status</span>
          </div>
          <p className="text-xs text-gray-500">
            <span className="text-gray-400">Issue Date:</span>{" "}
            <span className="font-semibold text-gray-700">{issueDate}</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="text-gray-400">Due Date:</span>{" "}
            <span className="font-semibold text-gray-700">{dueDate}</span>
          </p>
        </div>
      </div>

      {/* Table Headers */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-6">Description</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Rate</div>
        <div className="col-span-2 text-right">Amount</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100 px-6 flex-grow">
        {mockReceiptItems.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-2 py-5 text-sm items-start"
          >
            <div className="col-span-6">
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                {item.details}
              </p>
            </div>
            <div className="col-span-2 text-center font-medium text-gray-700 self-center">
              {item.quantity}
            </div>
            <div className="col-span-2 text-right font-medium text-gray-600 self-center">
              ${item.rate.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="col-span-2 text-right font-bold text-gray-900 self-center">
              $
              {item.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Total Section */}
      <div className="bg-[#f4f7fc] border-t border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">
            NOTE
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Please include the invoice number {invoiceNo} in all payment
            communications.
            <br />
            Thank you for your continued partnership with LogiFlow.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-gray-600 border-b border-gray-300 pb-2">
            <span>Tax (8%)</span>
            <span className="font-bold text-gray-900">${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
              Total Amount
            </span>
            <span className="text-lg font-bold text-gray-900">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceCard
