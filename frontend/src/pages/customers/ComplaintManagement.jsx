import { useMemo, useState } from "react";

const PAGE_SIZE = 5;

const complaintData = [
  {
    id: "CMP-3018",
    subject: "Cargo arrived damaged",
    customer: "Amelia Silva",
    email: "amelia.silva@example.com",
    initials: "AS",
    shipment: "SHP-89472A",
    category: "Damage",
    priority: "Urgent",
    assignedTo: "Tharushi N.",
    status: "Open",
  },
  {
    id: "CMP-3019",
    subject: "Unexpected delivery delay",
    customer: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    initials: "RK",
    shipment: "SHP-89480B",
    category: "Delay",
    priority: "High",
    assignedTo: "Thisuli S.",
    status: "Investigating",
  },
  {
    id: "CMP-3020",
    subject: "Incorrect invoice total",
    customer: "Maya Fernando",
    email: "maya.fernando@example.com",
    initials: "MF",
    shipment: "SHP-89495C",
    category: "Billing",
    priority: "Medium",
    assignedTo: "Naduni P.",
    status: "Resolved",
  },
  {
    id: "CMP-3021",
    subject: "Missing cargo item",
    customer: "Dilan Perera",
    email: "dilan.perera@example.com",
    initials: "DP",
    shipment: "SHP-89503D",
    category: "Loss",
    priority: "High",
    assignedTo: "Unassigned",
    status: "Open",
  },
  {
    id: "CMP-3022",
    subject: "Late notification received",
    customer: "Sara Nimal",
    email: "sara.nimal@example.com",
    initials: "SN",
    shipment: "SHP-89515E",
    category: "Communication",
    priority: "Low",
    assignedTo: "Tharushi N.",
    status: "Closed",
  },
];

function priorityClasses(priority) {
  switch (priority) {
    case "Urgent":
      return "bg-rose-100 text-rose-700";
    case "High":
      return "bg-red-100 text-red-700";
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
      return "bg-rose-100 text-rose-700";
    case "Investigating":
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

export default function ComplaintManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredComplaints = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return complaintData.filter((complaint) => {
      const matchesSearch =
        !searchValue ||
        complaint.id.toLowerCase().includes(searchValue) ||
        complaint.customer.toLowerCase().includes(searchValue) ||
        complaint.shipment.toLowerCase().includes(searchValue) ||
        complaint.category.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || complaint.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredComplaints.length / PAGE_SIZE)
  );

  const visibleComplaints = filteredComplaints.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const exportCSV = () => {
    const headings = [
      "Complaint ID",
      "Subject",
      "Customer",
      "Email",
      "Shipment",
      "Category",
      "Priority",
      "Assigned To",
      "Status",
    ];

    const rows = filteredComplaints.map((complaint) => [
      complaint.id,
      complaint.subject,
      complaint.customer,
      complaint.email,
      complaint.shipment,
      complaint.category,
      complaint.priority,
      complaint.assignedTo,
      complaint.status,
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
    link.download = "complaints.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Complaint Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Investigate, assign, prioritize, and resolve customer complaints
            with full traceability.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          New Complaint
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="priority_high"
          label="Open Complaints"
          value="34"
          trend="+7.2%"
          negative
          iconClasses="bg-rose-100 text-rose-700"
        />

        <StatCard
          icon="schedule"
          label="Under Investigation"
          value="18"
          trend="+2.8%"
          iconClasses="bg-amber-100 text-amber-700"
        />

        <StatCard
          icon="flag"
          label="High Priority"
          value="12"
          trend="+1.4%"
          negative
          iconClasses="bg-violet-100 text-violet-700"
        />

        <StatCard
          icon="check"
          label="Resolved This Month"
          value="89"
          trend="+16.3%"
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
              placeholder="Search by complaint ID, customer, shipment, or category..."
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
            <option value="Investigating">Investigating</option>
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
            <option value="Urgent">Urgent</option>
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
                  "Complaint",
                  "Customer",
                  "Shipment",
                  "Category",
                  "Priority",
                  "Assigned To",
                  "Status",
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
              {visibleComplaints.map((complaint, index) => (
                <tr
                  key={complaint.id}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">
                      #{complaint.id}
                    </p>

                    <p className="mt-1 max-w-[130px] text-xs leading-4 text-slate-500">
                      {complaint.subject}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClasses(
                          index
                        )}`}
                      >
                        {complaint.initials}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {complaint.customer}
                        </p>

                        <p className="text-xs text-slate-500">
                          {complaint.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    #{complaint.shipment}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {complaint.category}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(
                        complaint.priority
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {complaint.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {complaint.assignedTo}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        complaint.status
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {complaint.status}
                    </span>
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
                        {complaint.status === "Open"
                          ? "Assign"
                          : complaint.status === "Investigating"
                            ? "Update"
                            : complaint.status === "Resolved"
                              ? "Reopen"
                              : "History"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleComplaints.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            {filteredComplaints.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredComplaints.length
            )}{" "}
            of {filteredComplaints.length} complaints
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
  negative = false,
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

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            negative
              ? "bg-rose-100 text-rose-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
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