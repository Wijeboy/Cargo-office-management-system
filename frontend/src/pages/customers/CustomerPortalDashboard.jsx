const shipments = [
  {
    id: "SHP-89472A",
    route: "Colombo to Venice",
    detail: "Estimated delivery: 03 Jul 2026",
    status: "In Transit",
  },
  {
    id: "SHP-89480B",
    route: "Milan to Colombo",
    detail: "Delivered: 24 Jun 2026",
    status: "Delivered",
  },
  {
    id: "SHP-89503D",
    route: "Rome to Kandy",
    detail: "Awaiting pickup confirmation",
    status: "Pending",
  },
];

const notifications = [
  {
    title: "Shipment departed",
    message: "#SHP-89472A left the Colombo distribution centre.",
  },
  {
    title: "Payment reminder",
    message: "Invoice #INV-2145 is due on 04 Jul 2026.",
  },
  {
    title: "Inquiry updated",
    message: "Your inquiry #INQ-2041 has received a response.",
  },
];

function shipmentStatusClasses(status) {
  switch (status) {
    case "In Transit":
      return "bg-sky-100 text-sky-700";
    case "Delivered":
      return "bg-emerald-100 text-emerald-700";
    case "Pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function CustomerPortalDashboard() {
  return (
    <div className="space-y-6 animate-slide-up">
      <section className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-slate-950 to-sky-900 px-7 py-7 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, Amelia!
          </h1>

          <p className="mt-2 text-sm text-slate-200">
            Track your shipments, manage payments, and get customer support from
            one place.
          </p>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold">
          Customer ID: #CUS-10021
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon="local_shipping"
          label="Active Shipments"
          value="3"
        />

        <SummaryCard
          icon="check_circle"
          label="Delivered Shipments"
          value="18"
        />

        <SummaryCard
          icon="credit_card"
          label="Pending Payments"
          value="2"
        />

        <SummaryCard
          icon="chat_bubble_outline"
          label="Open Support Cases"
          value="1"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Shipments
              </h2>

              <button
                type="button"
                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
              >
                View all
              </button>
            </div>

            <div>
              {shipments.map((shipment) => (
                <article
                  key={shipment.id}
                  className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      #{shipment.id} — {shipment.route}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {shipment.detail}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${shipmentStatusClasses(
                      shipment.status
                    )}`}
                  >
                    {shipment.status}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <QuickAction
                icon="explore"
                title="Track Shipment"
                subtitle="Check current shipment status"
              />

              <QuickAction
                icon="credit_card"
                title="Make Payment"
                subtitle="Pay pending invoices"
              />

              <QuickAction
                icon="chat_bubble_outline"
                title="Submit Inquiry"
                subtitle="Ask about your cargo"
              />

              <QuickAction
                icon="warning_amber"
                title="Report Complaint"
                subtitle="Request customer support"
              />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Notifications
              </h2>

              <button
                type="button"
                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
              >
                View all
              </button>
            </div>

            <div className="px-5">
              {notifications.map((notification) => (
                <article
                  key={notification.title}
                  className="flex gap-3 border-b border-slate-200 py-5 last:border-b-0"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />

                  <div>
                    <p className="font-bold text-slate-900">
                      {notification.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {notification.message}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                Profile Summary
              </h2>

              <button
                type="button"
                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
              >
                Edit profile
              </button>
            </div>

            <div className="px-5 py-3">
              <ProfileRow label="Name" value="Amelia Silva" />
              <ProfileRow
                label="Email"
                value="amelia.silva@example.com"
              />
              <ProfileRow label="Phone" value="+94 77 512 8841" />
              <ProfileRow
                label="Preferred Channel"
                value="Email"
                last
              />
            </div>
          </section>
        </div>
      </section>

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

function SummaryCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
        <span className="material-symbols-outlined text-[20px] leading-none">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}

function QuickAction({ icon, title, subtitle }) {
  return (
    <button
      type="button"
      className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
        <span className="material-symbols-outlined text-[20px] leading-none">
          {icon}
        </span>
      </div>

      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}

function ProfileRow({ label, value, last = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        last ? "" : "border-b border-slate-200"
      }`}
    >
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}