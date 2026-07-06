import { useState } from "react";
import { Link } from "react-router-dom";

const initialForm = {
  firstName: "",
  lastName: "",
  customerType: "",
  companyName: "",
  email: "",
  contactNumber: "",
  alternativeNumber: "",
  country: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  preferredChannel: "Email",
  accountStatus: "Active",
  registrationSource: "Customer Service Desk",
  internalNotes: "",
};

export default function CustomerRegistration() {
  const [form, setForm] = useState(initialForm);

  const fullName =
    `${form.firstName} ${form.lastName}`.trim() || "New Customer";

  const initials =
    `${form.firstName?.[0] || "N"}${form.lastName?.[0] || "C"}`.toUpperCase();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(`Customer "${fullName}" registered successfully.`);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <Link
          to="/customers"
          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800"
        >
          <span aria-hidden="true">←</span>
          Back to Customer Management
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Customer Registration
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new customer profile and define communication preferences.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              New Customer Profile
            </h2>

            <p className="text-xs text-slate-500">
              Fields marked with * are required
            </p>
          </div>

          <FormSection
            icon="person"
            title="Personal Information"
            subtitle="Enter the customer’s basic identity details."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First Name" required>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Amelia"
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Last Name" required>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Silva"
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Customer Type" required>
                <select
                  name="customerType"
                  value={form.customerType}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select customer type</option>
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </Field>

              <Field label="Company Name">
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Optional company name"
                  className="form-input"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon="mail"
            title="Contact Information"
            subtitle="Add reliable contact details for communication."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email Address" required>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Contact Number" required>
                <input
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Alternative Number">
                <input
                  name="alternativeNumber"
                  value={form.alternativeNumber}
                  onChange={handleChange}
                  placeholder="Optional contact number"
                  className="form-input"
                />
              </Field>

              <Field label="Country" required>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select country</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="Italy">Italy</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon="home"
            title="Address Details"
            subtitle="Provide the customer’s primary address."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Street Address" required>
                  <input
                    name="streetAddress"
                    value={form.streetAddress}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    className="form-input"
                    required
                  />
                </Field>
              </div>

              <Field label="City" required>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Colombo"
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Postal Code">
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 00100"
                  className="form-input"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon="notifications"
            title="Communication Preferences"
            subtitle="Select how the customer prefers to receive updates."
          >
            <div className="flex flex-wrap gap-3">
              {["Email", "SMS", "Phone", "In-system"].map((channel) => (
                <label
                  key={channel}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    form.preferredChannel === channel
                      ? "border-sky-400 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredChannel"
                    value={channel}
                    checked={form.preferredChannel === channel}
                    onChange={handleChange}
                    className="accent-sky-600"
                  />

                  {channel}
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection
            icon="check"
            title="Account Status and Notes"
            subtitle="Set the initial status and add internal notes."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Account Status" required>
                <select
                  name="accountStatus"
                  value={form.accountStatus}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Archived">Archived</option>
                </select>
              </Field>

              <Field label="Registration Source">
                <input
                  name="registrationSource"
                  value={form.registrationSource}
                  onChange={handleChange}
                  className="form-input"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Internal Notes">
                  <textarea
                    name="internalNotes"
                    value={form.internalNotes}
                    onChange={handleChange}
                    placeholder="Add any important customer notes..."
                    rows="4"
                    className="form-input resize-none"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Visible only to authorized staff.
                  </p>
                </Field>
              </div>
            </div>
          </FormSection>

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
            <button
              type="button"
              onClick={clearForm}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Form
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Register Customer
            </button>
          </div>
        </form>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Customer Preview
            </h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700">
                {initials}
              </div>

              <div>
                <p className="font-bold text-slate-900">{fullName}</p>

                <p className="text-xs text-slate-500">
                  ID generated after registration
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-slate-200" />

            <p className="text-sm leading-6 text-slate-500">
              The preview updates while you enter the customer’s name.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Registration Checklist
            </h3>

            <div className="mt-4 space-y-4">
              {[
                "Confirm that the email address is unique.",
                "Check the contact number before saving.",
                "Select the correct customer type.",
                "Record the preferred communication channel.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <span className="material-symbols-outlined text-[14px]">
                      check
                    </span>
                  </div>

                  <p className="text-sm leading-5 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer className="flex flex-col gap-3 px-1 pb-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 LogiFlow Logistics Systems</p>

        <div className="flex gap-5">
          <a href="#">Support Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

function FormSection({ icon, title, subtitle, children }) {
  return (
    <section className="border-b border-slate-200 px-6 py-5 last:border-b-0">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <span className="material-symbols-outlined text-[19px]">
            {icon}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>

          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>

      {children}
    </label>
  );
}