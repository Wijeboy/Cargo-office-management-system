import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createShipment } from '../../lib/cargoApi';
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
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: '',
    senderContact: '',
    senderAddress: '',
    consigneeName: '',
    consigneeContact: '',
    consigneeAddress: '',
    origin: '',
    destination: '',
    description: '',
    weight: '',
    dimensions: '',
    bookingId: 'Auto-generated on submit',
    shippingMethod: '',
    expectedDeliveryDate: '',
    // routeId and vehicleId are scheduled later in Shipment Scheduling
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        senderName: form.senderName,
        senderContact: form.senderContact,
        senderAddress: form.senderAddress,
        consigneeName: form.consigneeName,
        consigneeContact: form.consigneeContact,
        consigneeAddress: form.consigneeAddress,
        origin: form.origin,
        destination: form.destination,
        weight: form.weight,
        description: form.description,
        dimensions: form.dimensions,
        shippingMethod: form.shippingMethod,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
      };

      const response = await createShipment(payload);
      setSuccess(`Booking created successfully: ${response.shipment.shipmentCode}`);
      setForm((prev) => ({
        ...prev,
        bookingId: response.shipment.shipmentCode,
      }));
      // Navigate to scheduling so user can select route and vehicle for the new booking
      const newId = response.shipment.id || response.shipment._id || response.shipment.bookingId || response.shipment.shipmentCode;
      navigate(`/scheduling?newId=${encodeURIComponent(newId)}`);
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h1 className="page-title">Create New Cargo Booking</h1>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/cargo" className="btn-secondary text-sm py-2 px-5">Cancel</Link>
            <button type="submit" className="btn-accent text-sm py-2 px-5" disabled={saving}>
              {saving ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
          {loading && <p className="mt-3 text-sm text-on-surface-variant">Processing...</p>}
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
          {success && <p className="mt-3 text-sm text-green-700">{success}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender Information */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Sender Information</h2>
          <div className="space-y-4">
            <FormField label="Full Name">
              <input placeholder="e.g. Acme Industries" className="input-field bg-surface-container-low" value={form.senderName} onChange={update('senderName')} />
            </FormField>
            <FormField label="Contact Number">
              <input type="tel" placeholder="+1 555 555 5555" className="input-field bg-surface-container-low" value={form.senderContact} onChange={update('senderContact')} />
            </FormField>
            <FormField label="Address">
              <textarea placeholder="Street, City, State, ZIP" className="input-field bg-surface-container-low min-h-[80px] resize-none" value={form.senderAddress} onChange={update('senderAddress')} />
            </FormField>
          </div>
        </div>

        {/* Consignee Information */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Consignee Information</h2>
          <div className="space-y-4">
            <FormField label="Consignee Name">
              <input placeholder="e.g. John Doe / Company" className="input-field bg-surface-container-low" value={form.consigneeName} onChange={update('consigneeName')} />
            </FormField>
            <FormField label="Contact Number">
              <input type="tel" placeholder="+1 555 555 5555" className="input-field bg-surface-container-low" value={form.consigneeContact} onChange={update('consigneeContact')} />
            </FormField>
            <FormField label="Address">
              <textarea placeholder="Street, City, State, ZIP" className="input-field bg-surface-container-low min-h-[80px] resize-none" value={form.consigneeAddress} onChange={update('consigneeAddress')} />
            </FormField>
          </div>
        </div>

        {/* Cargo Details */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md text-on-surface font-semibold mb-5">Cargo Details</h2>
          <div className="space-y-4">
            <FormField label="Description">
              <textarea placeholder="Brief description of goods (fragile, electronics, books...)" className="input-field bg-surface-container-low min-h-[80px] resize-none" value={form.description} onChange={update('description')} />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Weight (kg)">
                <input placeholder="e.g. 1200" className="input-field bg-surface-container-low" value={form.weight} onChange={update('weight')} />
              </FormField>
              <FormField label="Dimensions (L x W x H cm)">
                <input placeholder="e.g. 120 x 80 x 60" className="input-field bg-surface-container-low" value={form.dimensions} onChange={update('dimensions')} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Origin">
                <input placeholder="e.g. Lagos Warehouse" className="input-field bg-surface-container-low" value={form.origin} onChange={update('origin')} />
              </FormField>
              <FormField label="Destination">
                <input placeholder="e.g. Accra Hub" className="input-field bg-surface-container-low" value={form.destination} onChange={update('destination')} />
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
              <select className="input-field bg-surface-container-low" value={form.shippingMethod} onChange={update('shippingMethod')}>
                <option value="">Select shipping method</option>
                <option value="Road">Road</option>
                <option value="Air">Air</option>
                <option value="Sea">Sea</option>
                <option value="Rail">Rail</option>
                <option value="Express">Express</option>
              </select>
            </FormField>
            <FormField label="Expected Delivery Date">
              <input type="date" className="input-field bg-surface-container-low" value={form.expectedDeliveryDate} onChange={update('expectedDeliveryDate')} />
            </FormField>
            {/* Route and Vehicle selection moved to Shipment Scheduling */}
          </div>
        </div>
      </div>

        <div className="mt-4 text-sm text-on-surface-variant">
          <Link to="/cargo" className="text-accent hover:underline">← Back to Cargo Bookings</Link>
        </div>

        <PageFooter />
      </form>
    </div>
  );
}
