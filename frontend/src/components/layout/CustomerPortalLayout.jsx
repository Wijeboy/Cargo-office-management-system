import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/customer-portal/dashboard",
    icon: "dashboard",
  },
  {
    label: "My Shipments",
    path: "/customer-portal/shipments",
    icon: "local_shipping",
  },
  {
    label: "Track Shipment",
    path: "/customer-portal/track",
    icon: "explore",
  },
  {
    label: "Payments",
    path: "/customer-portal/payments",
    icon: "credit_card",
  },
  {
    label: "Inquiries",
    path: "/customer-portal/inquiries",
    icon: "chat_bubble_outline",
  },
  {
    label: "Complaints",
    path: "/customer-portal/complaints",
    icon: "warning_amber",
  },
  {
    label: "Notifications",
    path: "/customer-portal/notifications",
    icon: "notifications_none",
  },
  {
    label: "Profile",
    path: "/customer-portal/profile",
    icon: "person",
  },
];

export default function CustomerPortalLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-white">
        <div className="flex h-full w-60 items-center border-r border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white">
              <span className="material-symbols-outlined text-[20px]">
                local_shipping
              </span>
            </div>

            <span className="text-xl font-bold text-slate-900">
              LogiFlow
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between px-7">
          <div className="relative w-full max-w-xl">
            <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              search
            </span>

            <input
              type="text"
              placeholder="Search shipments, payments, support..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="ml-6 flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[21px]">
                notifications
              </span>
            </button>

            <button
              type="button"
              aria-label="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[21px]">
                settings
              </span>
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
              AS
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-30 flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 pb-5 pt-6">
          <h2 className="text-xl font-bold text-slate-900">
            Customer Portal
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Logistics Support Portal
          </p>
        </div>

        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-outlined text-[21px]">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 px-3 py-4">
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[21px]">
              help_outline
            </span>

            <span>Support</span>
          </button>

          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[21px]">
              logout
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="min-h-screen pl-60 pt-16">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}