import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

const inquiryData = [
  {
    id: "INQ-2041",
    subject: "Delayed delivery update",
    customer: "Amelia Silva",
    email: "amelia.silva@example.com",
    initials: "AS",
    shipment: "SHP-89472A",
    priority: "High",
    assignedTo: "Tharushi N.",
    status: "Open",
    created: "26 Jun 2026",
  },
  {
    id: "INQ-2042",
    subject: "Invoice clarification",
    customer: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    initials: "RK",
    shipment: "SHP-89480B",
    priority: "Medium",
    assignedTo: "Naduni P.",
    status: "In Progress",
    created: "25 Jun 2026",
  },
  {
    id: "INQ-2043",
    subject: "Change delivery contact",
    customer: "Maya Fernando",
    email: "maya.fernando@example.com",
    initials: "MF",
    shipment: "SHP-89495C",
    priority: "Low",
    assignedTo: "Thisuli S.",
    status: "Resolved",
    created: "24 Jun 2026",
  },
  {
    id: "INQ-2044",
    subject: "Damaged cargo evidence",
    customer: "Dilan Perera",
    email: "dilan.perera@example.com",
    initials: "DP",
    shipment: "SHP-89503D",
    priority: "High",
    assignedTo: "Unassigned",
    status: "Open",
    created: "23 Jun 2026",
  },
  {
    id: "INQ-2045",
    subject: "Receipt download request",
    customer: "Sara Nimal",
    email: "sara.nimal@example.com",
    initials: "SN",
    shipment: "SHP-89515E",
    priority: "Medium",
    assignedTo: "Tharushi N.",
    status: "Closed",
    created: "22 Jun 2026",
  },
];

function priorityClasses(priority) {
  switch (priority) {
    case "High":
      return "bg-rose-100 text-rose-700";
    case "Medium":
      return "bg-amber-100 text-amber-700";
    case "Low":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusClasses(status) {
  switch (status) {
    case "Open":
      return "bg-sky-100 text-sky-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Resolved":
      return "bg-emerald-100 text-emerald-700";
    case "Closed":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function avatarClasses(index) {
  const styles = [
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-orange-100 text-orange-700",
    "bg-emerald-100 text-emerald-700",
    "bg-slate-200 text-slate-600",
  ];

  return styles[index % styles.length];
}

export default function InquiryManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredInquiries = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return inquiryData.filter((inquiry) => {
      const matchesSearch =
        !searchValue ||
        inquiry.id.toLowerCase().includes(searchValue) ||
        inquiry.customer.toLowerCase().includes(searchValue) ||
        inquiry.subject.toLowerCase().includes(searchValue) ||
        inquiry.shipment.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || inquiry.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || inquiry.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInquiries.length / PAGE_SIZE)
  );

  const visibleInquiries = filteredInquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const exportCSV = () => {
    const headings = [
      "Inquiry ID",
      "Subject",
      "Customer",
      "Email",
      "Shipment",
      "Priority",
      "Assigned To",
      "Status",
      "Created",
    ];

    const rows = filteredInquiries.map((inquiry) => [
      inquiry.id,
      inquiry.subject,
      inquiry.customer,
      inquiry.email,
      inquiry.shipment,
      inquiry.priority,
      inquiry.assignedTo,
      inquiry.status,
      inquiry.created,
    ]);

    const csvContent = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inquiries.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Inquiry Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track, assign, prioritize, and resolve customer inquiries
            efficiently.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          New Inquiry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="chat"
          label="Total Inquiries"
          value="684"
          trend="+10.8%"
          iconClasses="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon="schedule"
          label="Open Inquiries"
          value="86"
          trend="+6.2%"
          iconClasses="bg-amber-100 text-amber-700"
        />

        <StatCard
          icon="progress_activity"
          label="In Progress"
          value="42"
          trend="+3.4%"
          iconClasses="bg-violet-100 text-violet-700"
        />

        <StatCard
          icon="check"
          label="Resolved This Month"
          value="193"
          trend="+14.1%"
          iconClasses="bg-emerald-100 text-emerald-700"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_160px_160px_120px]">
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
              placeholder="Search by inquiry ID, customer, subject, or shipment..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => {
              setPriorityFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Inquiry",
                  "Customer",
                  "Shipment",
                  "Priority",
                  "Assigned To",
                  "Status",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-slate-200 px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleInquiries.map((inquiry, index) => (
                <tr
                  key={inquiry.id}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">
                      #{inquiry.id}
                    </p>

                    <p className="mt-1 max-w-[130px] text-xs leading-4 text-slate-500">
                      {inquiry.subject}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClasses(
                          index
                        )}`}
                      >
                        {inquiry.initials}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {inquiry.customer}
                        </p>

                        <p className="text-xs text-slate-500">
                          {inquiry.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    #{inquiry.shipment}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(
                        inquiry.priority
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {inquiry.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {inquiry.assignedTo}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        inquiry.status
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {inquiry.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {inquiry.created}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {inquiry.status === "Open"
                          ? "Assign"
                          : inquiry.status === "In Progress"
                            ? "Update"
                            : inquiry.status === "Resolved"
                              ? "Reopen"
                              : "History"}
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
                  </td>
                </tr>
              ))}

              {visibleInquiries.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            {filteredInquiries.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredInquiries.length
            )}{" "}
            of {filteredInquiries.length} inquiries
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