import { useState } from "react";
import PageFooter from '../../components/layout/PageFooter';

export default function TrackCargo() {
  const [query, setQuery] = useState("LOGI-98402");
  const [isTracking, setIsTracking] = useState(true);

  const handleTrack = (e) => {
    e.preventDefault();
    setIsTracking(true);
  };

  return (
    <div className="min-h-screen bg-surface pb-12 animate-slide-up">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1f36]">
          Cargo Tracking
        </h1>
      </div>

      {/* ── Search Card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <form onSubmit={handleTrack}>
          <label className="block text-sm text-gray-500 mb-2">
            Enter Tracking Number (e.g., LOGI-98402)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="LOGI-98402"
            />
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors sm:w-auto w-full"
            >
              Track
            </button>
          </div>
        </form>
      </div>

      {/* ── Tracking Results ── */}
      {isTracking && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Status & Timeline */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Current Shipment Status</p>
              <h2 className="text-2xl font-bold text-[#2563eb] mb-2">Express Air Shipment (Oct 28)</h2>
              <p className="text-sm text-gray-500 mb-10">Current Location: New York (JFK)</p>

              <div className="relative pl-4 space-y-8">
                {/* Vertical Line Background */}
                <div className="absolute top-2 bottom-2 left-[23.5px] w-[2px] bg-gray-200" />
                {/* Vertical Line Active */}
                <div className="absolute top-2 bottom-[calc(100%-130px)] left-[23.5px] w-[2px] bg-[#10b981]" />

                {/* Step 1: Completed */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 z-10 border-[3px] border-white ring-1 ring-[#10b981]">
                    <span className="material-symbols-outlined text-white text-[14px] font-bold">add</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Shipped from Port Oakland</p>
                    <p className="text-xs text-gray-500 mt-0.5">Oct 26, 2024 - 10:00 AM</p>
                  </div>
                </div>

                {/* Step 2: Completed */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 z-10 border-[3px] border-white ring-1 ring-[#10b981]">
                    <span className="material-symbols-outlined text-white text-[14px] font-bold">add</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Arrived at Hub 1, Chicago</p>
                    <p className="text-xs text-gray-500 mt-0.5">Oct 27, 2024 - 06:30 PM</p>
                  </div>
                </div>

                {/* Step 3: Current */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0 z-10 border-[3px] border-white ring-1 ring-[#f59e0b]">
                    <span className="material-symbols-outlined text-white text-[14px] font-bold">add</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Departed Hub 2, New York (JFK)</p>
                    <p className="text-xs text-gray-500 mt-0.5">Oct 28, 2024 - 08:00 AM (Est.)</p>
                  </div>
                </div>

                {/* Step 4: Pending */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 z-10 border-2 border-gray-300">
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-gray-500">Arrived JFK Airport</p>
                  </div>
                </div>

                {/* Step 5: Pending */}
                <div className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 z-10 border-2 border-gray-300">
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-gray-500">Out for Delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Cargo Details */}
            <div>
              <div className="border border-gray-200 rounded-xl p-6 min-h-[400px]">
                <h3 className="text-sm font-bold text-gray-900 mb-6">Cargo Details</h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sender</p>
                    <p className="text-sm font-bold text-gray-900">Acme Logistics Inc.</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Consignee</p>
                    <p className="text-sm font-bold text-gray-900">Apex Manufacturing Solutions</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Destination</p>
                    <p className="text-sm font-bold text-gray-900">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}
