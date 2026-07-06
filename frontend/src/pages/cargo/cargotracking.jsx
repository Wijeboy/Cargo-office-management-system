import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function CargoBooking() {
  const [form, setForm] = useState({
    senderName: "",
    senderContact: "",
    senderAddress: "",
    consigneeName: "",
    contactPerson: "",
    consigneeAddress: "",
    description: "",
    weight: "",
    dimensions: "",
    shippingMethod: "Express Air",
    expectedDate: "",
  });

  const bookingId = "LOGI-" + Math.floor(10000 + Math.random() * 90000);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveDraft = () => {
    alert("Booking saved as draft.");
  };

  const handleCreate = () => {
    alert(`Booking ${bookingId} created successfully.`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-12">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Cargo Booking
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Create Booking
            </button>
          </div>
        </div>

        {/* ── 2 × 2 Card Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ─ Sender Information ─ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Sender Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Full Name
                </label>
                <input
                  name="senderName"
                  value={form.senderName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Logistics Inc."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Contact Number
                </label>
                <input
                  name="senderContact"
                  value={form.senderContact}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Address
                </label>
                <textarea
                  name="senderAddress"
                  value={form.senderAddress}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Full pickup address"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* ─ Consignee Information ─ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Consignee Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Consignee Name
                </label>
                <input
                  name="consigneeName"
                  value={form.consigneeName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Manufacturing Solutions"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Contact Person
                </label>
                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Chen"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Address
                </label>
                <textarea
                  name="consigneeAddress"
                  value={form.consigneeAddress}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Full delivery address"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* ─ Cargo Details ─ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Cargo Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Machine parts, model XYZ-7"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="e.g. 1,240"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Dimensions (L × W × H cm)
                  </label>
                  <input
                    name="dimensions"
                    value={form.dimensions}
                    onChange={handleChange}
                    placeholder="e.g. 120 × 80 × 150"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─ Booking Details ─ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Booking Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Booking ID
                </label>
                <input
                  value={bookingId}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-blue-600 font-medium focus:outline-none cursor-default"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Shipping Method
                </label>
                <select
                  name="shippingMethod"
                  value={form.shippingMethod}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                >
                  <option>Express Air</option>
                  <option>Standard Sea Freight</option>
                  <option>Road Transport</option>
                  <option>Rail Freight</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Expected Date
                </label>
                <input
                  type="date"
                  name="expectedDate"
                  value={form.expectedDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="mt-10 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            © 2024 LogiFlow Systems Inc.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}