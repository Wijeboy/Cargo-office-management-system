import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_CUSTOMERS } from "../../data/mockData";

const PAGE_SIZE = 5;

const customerDefaults = [
  {
    customerId: "CUS-10021",
    type: "Enterprise",
    preferredChannel: "Email",
    status: "Active",
    openCases: 0,
  },
  {
    customerId: "CUS-10022",
    type: "Business",
    preferredChannel: "SMS",
    status: "Active",
    openCases: 1,
  },
  {
    customerId: "CUS-10023",
    type: "Individual",
    preferredChannel: "Email",
    status: "Pending",
    openCases: 0,
  },
  {
    customerId: "CUS-10024",
    type: "Enterprise",
    preferredChannel: "Phone",
    status: "Active",
    openCases: 2,
  },
  {
    customerId: "CUS-10025",
    type: "Individual",
    preferredChannel: "Email",
    status: "Archived",
    openCases: 0,
  },
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function statusClasses(status) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Pending":
      return "bg-amber-100 text-amber-700";
    case "Archived":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function CustomerList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const customers = useMemo(
    () =>
      MOCK_CUSTOMERS.map((customer, index) => {
        const defaults =
          customerDefaults[index % customerDefaults.length];

        return {
          ...customer,
          customerId:
            customer.customerId ||
            customer.id ||
            defaults.customerId,
          type: customer.type || defaults.type,
          preferredChannel:
            customer.preferredChannel ||
            defaults.preferredChannel,
          status: customer.status || defaults.status,
          openCases:
            customer.openCases ?? defaults.openCases,
        };
      }),
    []
  );

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        customer.name?.toLowerCase().includes(normalizedSearch) ||
        customer.email?.toLowerCase().includes(normalizedSearch) ||
        customer.contactNo
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        customer.customerId
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        customer.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [customers, search, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const visibleCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (event) => {
    setTypeFilter(event.target.value);
    setCurrentPage(1);
  };

  const exportCustomers = () => {
    const headings = [
      "Customer ID",
      "Name",
      "Email",
      "Contact Number",
      "Type",
      "Preferred Channel",
      "Status",
      "Open Cases",
    ];

    const rows = filteredCustomers.map((customer) => [
      customer.customerId,
      customer.name,
      customer.email,
      customer.contactNo,
      customer.type,
      customer.preferredChannel,
      customer.status,
      customer.openCases,
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
    link.download = "customers.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Customer Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer profiles, contact details,
            communication preferences, and account status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/customers/register")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-lg">+</span>
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="group"
          label="Total Customers"
          value="2,486"
          trend="+8.4%"
          iconClasses="bg-blue-100 text-blue-700"
        />

        <StatCard
          icon="check"
          label="Active Customers"
          value="2,214"
          trend="+5.1%"
          iconClasses="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          icon="schedule"
          label="New This Month"
          value="128"
          trend="+12.7%"
          iconClasses="bg-amber-100 text-amber-700"
        />

        <StatCard
          icon="priority_high"
          label="Open Complaints"
          value="34"
          trend="-3.2%"
          negative
          iconClasses="bg-rose-100 text-rose-700"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_160px_210px_120px]">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by customer name, email, phone, or ID..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={typeFilter}
            onChange={handleTypeFilter}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="All">All customer types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Business">Business</option>
            <option value="Individual">Individual</option>
          </select>

          <button
            type="button"
            onClick={exportCustomers}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Customer",
                  "Customer ID",
                  "Type",
                  "Contact Number",
                  "Preferred Channel",
                  "Status",
                  "Open Cases",
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
              {visibleCustomers.map((customer, index) => (
                <tr
                  key={customer.id || customer.customerId}
                  className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          index % 4 === 0
                            ? "bg-blue-100 text-blue-700"
                            : index % 4 === 1
                              ? "bg-violet-100 text-violet-700"
                              : index % 4 === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {getInitials(customer.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {customer.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    #{customer.customerId}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {customer.type}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {customer.contactNo}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {customer.preferredChannel}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        customer.status
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {customer.openCases > 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {customer.openCases} open
                      </span>
                    ) : (
                      customer.openCases
                    )}
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
                        Edit
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

              {visibleCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            {filteredCustomers.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredCustomers.length
            )}{" "}
            of {filteredCustomers.length} customers
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

      <footer className="flex flex-col gap-3 px-1 pb-2 pt-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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

      <p className="mt-3 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}