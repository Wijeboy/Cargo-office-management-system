import React from 'react';

const InvoiceCard = ({ invoice }) => {
  // Extract and format customer info from database or fallback to mock
  const clientName = invoice?.customer?.name || invoice?.clientName || invoice?.client || 'Apex Manufacturing';
  const customerEmail = invoice?.customer?.email || 'contact@apexmf.com';
  const customerPhone = invoice?.customer?.contactNo || '';
  const customerAddress = invoice?.customer?.address || '451 Industrial Parkway, Detroit, MI 48201';
  const customerCompany = invoice?.customer?.company || 'Apex Manufacturing Ltd.';

  // Map status from Prisma (e.g., 'PAID', 'PENDING', 'OVERDUE') or fallback
  const rawStatus = invoice?.paymentStatus || invoice?.status || 'PAID';
  // Capitalize nicely
  const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  // Format dates
  const issueDate = invoice?.date || invoice?.issueDate
    ? new Date(invoice.date || invoice.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Oct 24, 2023';

  const getDueDate = () => {
    if (invoice?.dueDate) {
      return new Date(invoice.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    // Default to issueDate + 30 days if no due date specified
    const baseDate = invoice?.date || invoice?.issueDate;
    if (baseDate) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + 30);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return 'Nov 24, 2023';
  };
  const dueDate = getDueDate();

  // Calculate subtotals
  const tax = invoice?.tax ?? 0;
  const total = invoice?.totalAmount ?? invoice?.total ?? 0;
  const subtotal = total - tax;
  const calculatedTaxRate = subtotal > 0 ? Math.round((tax / subtotal) * 100) : 8;
  const invoiceNo = invoice?.invoiceNo || 'INV-1043';

  // Get line items from database invoice notes or fallback
  let receiptItems = [];
  let customNotes = '';
  if (invoice?.notes) {
    try {
      const parsed = JSON.parse(invoice.notes);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.items)) {
          receiptItems = parsed.items;
          customNotes = parsed.customNotes || '';
        } else if (Array.isArray(parsed)) {
          // Backward compatibility with legacy direct array structure
          receiptItems = parsed;
        }
      } else {
        customNotes = String(invoice.notes);
      }
    } catch (e) {
      // notes is plain text, not JSON
      customNotes = invoice.notes;
    }
  }

  // If no items extracted, generate a default one based on the shipment details
  if (receiptItems.length === 0) {
    const shipmentCode = invoice?.shipment?.shipmentCode || 'LOG-XXXX';
    const origin = invoice?.shipment?.origin || 'Origin';
    const destination = invoice?.shipment?.destination || 'Destination';
    const weight = invoice?.shipment?.weight || 0;
    const description = invoice?.shipment?.description || 'Cargo freight transport';

    receiptItems = [
      {
        title: `Freight Shipment Delivery (${shipmentCode})`,
        details: `${description} | Route: ${origin} → ${destination} | Weight: ${weight} kg`,
        quantity: 1,
        rate: subtotal,
        amount: subtotal
      }
    ];
  }

  // Choose badge color based on status
  const badgeStyles = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Overdue: "bg-rose-100 text-rose-700",
  };
  const currentBadgeStyle = badgeStyles[status] || "bg-gray-100 text-gray-700";

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
          {customerCompany && <p className="text-gray-700 text-xs mt-0.5">{customerCompany}</p>}
          <p className="text-gray-500 text-xs mt-1 whitespace-pre-line">
            {customerAddress}
          </p>
          <p className="text-gray-500 text-xs mt-1">{customerEmail}</p>
          {customerPhone && <p className="text-gray-500 text-xs mt-0.5">{customerPhone}</p>}
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
            Transaction Info
          </h3>
          <div className="mb-2">
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentBadgeStyle}`}>
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
          {invoice?.paymentMethod && (
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">Payment:</span>{" "}
              <span className="font-semibold text-gray-700">{invoice.paymentMethod}</span>
            </p>
          )}
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
        {receiptItems.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-2 py-5 text-sm items-start"
          >
            <div className="col-span-6">
              <p className="font-semibold text-gray-900">{item.title || item.description}</p>
              {item.details && (
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  {item.details}
                </p>
              )}
            </div>
            <div className="col-span-2 text-center font-medium text-gray-700 self-center">
              {item.quantity || item.qty || 1}
            </div>
            <div className="col-span-2 text-right font-medium text-gray-600 self-center">
              ${(item.rate || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="col-span-2 text-right font-bold text-gray-900 self-center">
              $
              {(item.amount || (item.quantity * item.rate) || 0).toLocaleString("en-US", {
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
          {customNotes ? (
            <p className="text-xs text-gray-500 leading-relaxed italic mb-2">
              "{customNotes}"
            </p>
          ) : null}
          <p className="text-xs text-gray-500 leading-relaxed">
            Please include the invoice number <span className="font-semibold">{invoiceNo}</span> in all payment communications.
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
            <span>Tax ({calculatedTaxRate}%)</span>
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

export default InvoiceCard;
