import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKING_DEFAULTS } from '../../data/mockData';
import PageFooter from '../../components/layout/PageFooter';

function FormField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

export default function CreateBooking() {
  const defaults = MOCK_BOOKING_DEFAULTS;
  const [form, setForm] = useState({
    senderName: defaults.sender.fullName,
    senderContact: defaults.sender.contactNumber,
    senderAddress: defaults.sender.address,
    consigneeName: defaults.consignee.name,
    consigneeContact: defaults.consignee.contactPerson,
    consigneeAddress: defaults.consignee.address,
    description: defaults.cargo.description,
    weight: String(defaults.cargo.weight),
    dimensions: defaults.cargo.dimensions,
    bookingId: defaults.bookingId,
    shippingMethod: defaults.booking.shippingMethod,
    expectedDate: defaults.booking.expectedDate,
  });

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="page-title">Create New Cargo Booking</h1>
        <div className="flex flex-wrap gap-3 mt-4">
          <button type="button" className="btn-secondary text-sm py-2 px-5">Save as Draft</button>
          <button type="button" className="btn-accent text-sm py-2 px-5">Create Booking</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender Information */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Sender Information</h2>
          <div className="space-y-4">
            <FormField label="Full Name">
              <input className="input-field bg-surface-container-low" value={form.senderName} onChange={update('senderName')} />
            </FormField>
            <FormField label="Contact Number">
              <input className="input-field bg-surface-container-low" value={form.senderContact} onChange={update('senderContact')} />
            </FormField>
            <FormField label="Address">
              <textarea className="input-field bg-surface-container-low min-h-[80px] resize-none" value={form.senderAddress} onChange={update('senderAddress')} />
            </FormField>
          </div>
        </div>

        {/* Consignee Information */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Consignee Information</h2>
          <div className="space-y-4">
            <FormField label="Consignee Name">
              <input className="input-field bg-surface-container-low" value={form.consigneeName} onChange={update('consigneeName')} />
            </FormField>
            <FormField label="Contact Person">
              <input className="input-field bg-surface-container-low" value={form.consigneeContact} onChange={update('consigneeContact')} />
            </FormField>
            <FormField label="Address">
              <textarea className="input-field bg-surface-container-low min-h-[80px] resize-none" value={form.consigneeAddress} onChange={update('consigneeAddress')} />
            </FormField>
          </div>
        </div>

        {/* Cargo Details */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Cargo Details</h2>
          <div className="space-y-4">
            <FormField label="Description">
              <textarea className="input-field bg-surface-container-low min-h-[80px] resize-none" value={form.description} onChange={update('description')} />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Weight (kg)">
                <input className="input-field bg-surface-container-low" value={form.weight} onChange={update('weight')} />
              </FormField>
              <FormField label="Dimensions (L x W x H cm)">
                <input className="input-field bg-surface-container-low" value={form.dimensions} onChange={update('dimensions')} />
              </FormField>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Booking Details</h2>
          <div className="space-y-4">
            <FormField label="Booking ID">
              <input className="input-field bg-surface-container-low text-accent font-semibold" value={form.bookingId} onChange={update('bookingId')} readOnly />
            </FormField>
            <FormField label="Shipping Method">
              <input className="input-field bg-surface-container-low" value={form.shippingMethod} onChange={update('shippingMethod')} />
            </FormField>
            <FormField label="Expected Date">
              <input className="input-field bg-surface-container-low" value={form.expectedDate} onChange={update('expectedDate')} />
            </FormField>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-on-surface-variant">
        <Link to="/cargo" className="text-accent hover:underline">← Back to Cargo Bookings</Link>
      </div>

      <PageFooter />
    </div>
  );
}
