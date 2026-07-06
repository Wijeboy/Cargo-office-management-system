import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

const notificationData = [
  {
    id: 1,
    title: "Shipment Dispatched",
    message:
      "Your shipment #SHP-89472A has left the Colombo distribution centre and is now in transit.",
    recipient: "Amelia Silva",
    channel: "Email",
    date: "26 Jun 2026, 10:30 AM",
    status: "Sent",
    icon: "mail",
    iconClasses: "bg-violet-100 text-violet-700",
    action: "View",
  },
  {
    id: 2,
    title: "Delivery Reminder",
    message:
      "Your cargo is expected tomorrow. Please ensure an authorized person is available to receive it.",
    recipient: "Ravi Kumar",
    channel: "SMS",
    date: "Scheduled: 27 Jun 2026, 8:00 AM",
    status: "Scheduled",
    icon: "schedule",
    iconClasses: "bg-emerald-100 text-emerald-700",
    action: "Edit",
  },
  {
    id: 3,
    title: "Delivery Delay Alert",
    message:
      "Shipment #SHP-89503D has been delayed due to an operational issue. A new ETA will be shared shortly.",
    recipient: "Dilan Perera",
    channel: "Alert",
    date: "25 Jun 2026, 5:42 PM",
    status: "Failed",
    icon: "priority_high",
    iconClasses: "bg-rose-100 text-rose-700",
    action: "Retry",
  },
  {
    id: 4,
    title: "Complaint Status Updated",
    message:
      "Complaint #CMP-3020 has been resolved. The resolution note is available in your customer portal.",
    recipient: "Maya Fernando",
    channel: "In-system",
    date: "24 Jun 2026, 2:18 PM",
    status: "Sent",
    icon: "settings",
    iconClasses: "bg-amber-100 text-amber-700",
    action: "View",
  },
  {
    id: 5,
    title: "Monthly Service Update",
    message:
      "Draft notification summarizing recent service improvements and customer support updates.",
    recipient: "All active customers",
    channel: "Email",
    date: "Last edited 23 Jun 2026",
    status: "Draft",
    icon: "mail",
    iconClasses: "bg-violet-100 text-violet-700",
    action: "Continue",
  },
];

function statusClasses(status) {
  switch (status) {
    case "Sent":
      return "bg-emerald-100 text-emerald-700";
    case "Scheduled":
      return "bg-sky-100 text-sky-700";
    case "Failed":
      return "bg-rose-100 text-rose-700";
    case "Draft":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function NotificationManagement() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [delivery, setDelivery] = useState("Send now");
  const [channels, setChannels] = useState({
    Email: true,
    SMS: false,
    "In-system": false,
    Alert: false,
  });

  const filteredNotifications = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return notificationData.filter((notification) => {
      const matchesSearch =
        !searchValue ||
        notification.title.toLowerCase().includes(searchValue) ||
        notification.recipient.toLowerCase().includes(searchValue) ||
        notification.message.toLowerCase().includes(searchValue);

      const matchesChannel =
        channelFilter === "All" ||
        notification.channel === channelFilter;

      const matchesStatus =
        statusFilter === "All" ||
        notification.status === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [search, channelFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE)
  );

  const visibleNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleChannel = (channel) => {
    setChannels((current) => ({
      ...current,
      [channel]: !current[channel],
    }));
  };

  const clearQuickForm = () => {
    setRecipient("");
    setSubject("");
    setMessage("");
    setDelivery("Send now");
    setChannels({
      Email: true,
      SMS: false,
      "In-system": false,
      Alert: false,
    });
  };

  const handleSend = () => {
    if (!recipient || !subject || !message) {
      alert("Please complete the recipient, subject, and message fields.");
      return;
    }

    alert("Notification sent successfully.");
    clearQuickForm();
  };

  const handleSaveDraft = () => {
    alert("Notification draft saved.");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Notification Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, schedule, and monitor customer notifications across
            multiple channels.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          Create Notification
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="notifications"
          label="Notifications Sent"
          value="3,482"
          trend="+12.4%"
          iconClasses="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon="check"
          label="Delivery Success Rate"
          value="98.6%"
          trend="98.6%"
          iconClasses="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          icon="schedule"
          label="Scheduled"
          value="27"
          trend="+8.1%"
          iconClasses="bg-amber-100 text-amber-700"
        />

        <StatCard
          icon="priority_high"
          label="Failed Deliveries"
          value="49"
          trend="1.4%"
          iconClasses="bg-rose-100 text-rose-700"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_160px_160px]">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                search
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, recipient, shipment, or message..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(event) => {
                setChannelFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              <option value="All">All channels</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="In-system">In-system</option>
              <option value="Alert">Alert</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Sent">Sent</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Failed">Failed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div>
            {visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className="flex gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notification.iconClasses}`}
                >
                  <span className="material-symbols-outlined text-[20px] leading-none">
                    {notification.icon}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {notification.action}
                      </button>

                      <button
                        type="button"
                        aria-label="More actions"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      >
                        <span className="material-symbols-outlined text-lg">
                          more_vert
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{notification.recipient}</span>
                    <span>•</span>
                    <span>{notification.channel}</span>
                    <span>•</span>
                    <span>{notification.date}</span>

                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${statusClasses(
                        notification.status
                      )}`}
                    >
                      {notification.status}
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {visibleNotifications.length === 0 && (
              <div className="px-5 py-14 text-center text-sm text-slate-500">
                No notifications found.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              {filteredNotifications.length === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}
              –
              {Math.min(
                currentPage * PAGE_SIZE,
                filteredNotifications.length
              )}{" "}
              of {filteredNotifications.length} notifications
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {Array.from(
                { length: Math.min(totalPages, 3) },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold ${
                    currentPage === page
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Quick Notification
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Compose and send a customer notification directly from this panel.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Recipient">
              <select
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="form-input"
              >
                <option value="">Select customer</option>
                <option value="Amelia Silva">Amelia Silva</option>
                <option value="Ravi Kumar">Ravi Kumar</option>
                <option value="Maya Fernando">Maya Fernando</option>
                <option value="Dilan Perera">Dilan Perera</option>
                <option value="Sara Nimal">Sara Nimal</option>
              </select>
            </Field>

            <Field label="Subject">
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Enter notification subject"
                className="form-input"
              />
            </Field>

            <Field label="Channels">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(channels).map((channel) => (
                  <label
                    key={channel}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={channels[channel]}
                      onChange={() => toggleChannel(channel)}
                      className="accent-blue-600"
                    />

                    {channel}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Message">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write the notification message..."
                rows="5"
                className="form-input resize-none"
              />
            </Field>

            <Field label="Delivery">
              <select
                value={delivery}
                onChange={(event) => setDelivery(event.target.value)}
                className="form-input"
              >
                <option value="Send now">Send now</option>
                <option value="Schedule">Schedule</option>
                <option value="Save as draft">Save as draft</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleSend}
                className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Send
              </button>
            </div>
          </div>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  iconClasses,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClasses}`}
        >
          <span className="material-symbols-outlined block text-[20px] leading-none">
            {icon}
          </span>
        </div>

        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-600">
          {trend}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}