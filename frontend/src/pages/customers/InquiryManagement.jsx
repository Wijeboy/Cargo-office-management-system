import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";

const PAGE_SIZE = 5;

const initialCreateForm = {
  name: "",
  email: "",
  contactNo: "",
  subject: "",
  message: "",
  category: "GENERAL",
  priority: "MEDIUM",
};

const initialUpdateForm = {
  status: "OPEN",
  priority: "MEDIUM",
  assignedTo: "",
  response: "",
};

function formatEnum(value = "") {
  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function priorityClasses(priority) {
  switch (String(priority).toUpperCase()) {
    case "HIGH":
      return "bg-rose-100 text-rose-700";

    case "MEDIUM":
      return "bg-amber-100 text-amber-700";

    case "LOW":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusClasses(status) {
  switch (String(status).toUpperCase()) {
    case "OPEN":
      return "bg-sky-100 text-sky-700";

    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-700";

    case "RESOLVED":
      return "bg-emerald-100 text-emerald-700";

    case "CLOSED":
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

function normalizeInquiry(inquiry) {
  return {
    ...inquiry,
    id: inquiry.id,
    inquiryNo: inquiry.inquiryNo || inquiry.id,
    name: inquiry.name || inquiry.customer?.name || "Unknown Customer",
    email: inquiry.email || inquiry.customer?.email || "Not provided",
    contactNo:
      inquiry.contactNo ||
      inquiry.customer?.contactNo ||
      "Not provided",
    subject: inquiry.subject || "No subject",
    message: inquiry.message || "",
    category: inquiry.category || "GENERAL",
    priority: inquiry.priority || "MEDIUM",
    status: inquiry.status || "OPEN",
    assignedTo: inquiry.assignedTo || "Unassigned",
    response: inquiry.response || "",
    createdAt: inquiry.createdAt || null,
    updatedAt: inquiry.updatedAt || null,
    customerId: inquiry.customerId || null,
  };
}

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadInquiries = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await apiRequest("/inquiries");

      const list = Array.isArray(response.inquiries)
        ? response.inquiries.map(normalizeInquiry)
        : [];

      setInquiries(list);
    } catch (error) {
      console.error("Failed to load inquiries:", error);

      setPageError(
        error.message ||
          "Failed to load inquiries. Check whether the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const filteredInquiries = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const matchesSearch =
        !searchValue ||
        inquiry.inquiryNo.toLowerCase().includes(searchValue) ||
        inquiry.name.toLowerCase().includes(searchValue) ||
        inquiry.email.toLowerCase().includes(searchValue) ||
        inquiry.subject.toLowerCase().includes(searchValue) ||
        inquiry.category.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        inquiry.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        inquiry.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [inquiries, search, statusFilter, priorityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInquiries.length / PAGE_SIZE),
  );

  const visibleInquiries = filteredInquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statistics = useMemo(() => {
    const now = new Date();

    const resolvedThisMonth = inquiries.filter((inquiry) => {
      if (inquiry.status !== "RESOLVED" || !inquiry.updatedAt) {
        return false;
      }

      const updatedDate = new Date(inquiry.updatedAt);

      return (
        updatedDate.getMonth() === now.getMonth() &&
        updatedDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      total: inquiries.length,
      open: inquiries.filter(
        (inquiry) => inquiry.status === "OPEN",
      ).length,
      inProgress: inquiries.filter(
        (inquiry) => inquiry.status === "IN_PROGRESS",
      ).length,
      resolvedThisMonth,
    };
  }, [inquiries]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateChange = (event) => {
    const { name, value } = event.target;

    setUpdateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openViewModal = async (inquiry) => {
    setPageError("");

    try {
      const response = await apiRequest(`/inquiries/${inquiry.id}`);

      setSelectedInquiry(
        normalizeInquiry(response.inquiry || inquiry),
      );

      setViewModalOpen(true);
    } catch (error) {
      console.error("Failed to load inquiry details:", error);

      setPageError(
        error.message || "Failed to load inquiry details.",
      );
    }
  };

  const openUpdateModal = (inquiry) => {
    setSelectedInquiry(inquiry);

    setUpdateForm({
      status: inquiry.status,
      priority: inquiry.priority,
      assignedTo:
        inquiry.assignedTo === "Unassigned"
          ? ""
          : inquiry.assignedTo,
      response: inquiry.response || "",
    });

    setUpdateModalOpen(true);
  };

  const handleCreateInquiry = async (event) => {
    event.preventDefault();

    setCreating(true);
    setPageError("");
    setSuccessMessage("");

    const payload = {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      contactNo: createForm.contactNo.trim(),
      subject: createForm.subject.trim(),
      message: createForm.message.trim(),
      category: createForm.category,
      priority: createForm.priority,
    };

    try {
      await apiRequest("/inquiries", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccessMessage("Inquiry submitted successfully.");
      setCreateModalOpen(false);
      setCreateForm(initialCreateForm);

      await loadInquiries();
    } catch (error) {
      console.error("Failed to create inquiry:", error);

      setPageError(
        error.message || "Failed to submit inquiry.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateInquiry = async (event) => {
    event.preventDefault();

    if (!selectedInquiry?.id) {
      return;
    }

    setUpdating(true);
    setPageError("");
    setSuccessMessage("");

    const payload = {
      status: updateForm.status,
      priority: updateForm.priority,
      assignedTo: updateForm.assignedTo.trim() || null,
      response: updateForm.response.trim() || null,
    };

    try {
      await apiRequest(`/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccessMessage("Inquiry updated successfully.");
      setUpdateModalOpen(false);
      setSelectedInquiry(null);

      await loadInquiries();
    } catch (error) {
      console.error("Failed to update inquiry:", error);

      setPageError(
        error.message || "Failed to update inquiry.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusChange = async (inquiry) => {
    let nextStatus = "IN_PROGRESS";

    if (inquiry.status === "IN_PROGRESS") {
      nextStatus = "RESOLVED";
    } else if (
      inquiry.status === "RESOLVED" ||
      inquiry.status === "CLOSED"
    ) {
      nextStatus = "OPEN";
    }

    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/inquiries/${inquiry.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: nextStatus,
          priority: inquiry.priority,
          assignedTo:
            inquiry.assignedTo === "Unassigned"
              ? null
              : inquiry.assignedTo,
          response: inquiry.response || null,
        }),
      });

      setSuccessMessage(
        `Inquiry status changed to ${formatEnum(nextStatus)}.`,
      );

      await loadInquiries();
    } catch (error) {
      console.error("Failed to change inquiry status:", error);

      setPageError(
        error.message || "Failed to change inquiry status.",
      );
    }
  };

  const handleDeleteInquiry = async (inquiry) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete inquiry "${inquiry.inquiryNo}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(inquiry.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/inquiries/${inquiry.id}`, {
        method: "DELETE",
      });

      setInquiries((current) =>
        current.filter((item) => item.id !== inquiry.id),
      );

      setSuccessMessage("Inquiry deleted successfully.");
    } catch (error) {
      console.error("Failed to delete inquiry:", error);

      setPageError(
        error.message || "Failed to delete inquiry.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const exportCSV = () => {
    const headings = [
      "Inquiry Number",
      "Subject",
      "Customer",
      "Email",
      "Contact Number",
      "Category",
      "Priority",
      "Assigned To",
      "Status",
      "Response",
      "Created",
    ];

    const rows = filteredInquiries.map((inquiry) => [
      inquiry.inquiryNo,
      inquiry.subject,
      inquiry.name,
      inquiry.email,
      inquiry.contactNo,
      formatEnum(inquiry.category),
      formatEnum(inquiry.priority),
      inquiry.assignedTo,
      formatEnum(inquiry.status),
      inquiry.response,
      formatDate(inquiry.createdAt),
    ]);

    const csvContent = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inquiries.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
          onClick={() => {
            setCreateForm(initialCreateForm);
            setCreateModalOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          New Inquiry
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {pageError && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{pageError}</span>

          <button
            type="button"
            onClick={loadInquiries}
            className="w-fit rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold hover:bg-rose-100"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="chat"
          label="Total Inquiries"
          value={statistics.total}
          iconClasses="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon="schedule"
          label="Open Inquiries"
          value={statistics.open}
          iconClasses="bg-amber-100 text-amber-700"
        />

        <StatCard
          icon="progress_activity"
          label="In Progress"
          value={statistics.inProgress}
          iconClasses="bg-violet-100 text-violet-700"
        />

        <StatCard
          icon="check"
          label="Resolved This Month"
          value={statistics.resolvedThisMonth}
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
              placeholder="Search by inquiry number, customer, subject, or category..."
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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
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
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredInquiries.length === 0}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Inquiry",
                  "Customer",
                  "Category",
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
              {loading && (
                <tr>
                  <td colSpan="8" className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <span className="material-symbols-outlined animate-spin text-3xl text-sky-600">
                        progress_activity
                      </span>

                      <span className="text-sm font-medium">
                        Loading inquiries...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                visibleInquiries.map((inquiry, index) => (
                  <tr
                    key={inquiry.id}
                    className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        #{inquiry.inquiryNo}
                      </p>

                      <p className="mt-1 max-w-[190px] text-xs leading-4 text-slate-500">
                        {inquiry.subject}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClasses(
                            index,
                          )}`}
                        >
                          {getInitials(inquiry.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {inquiry.name}
                          </p>

                          <p className="max-w-[190px] truncate text-xs text-slate-500">
                            {inquiry.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {formatEnum(inquiry.category)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(
                          inquiry.priority,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {formatEnum(inquiry.priority)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {inquiry.assignedTo}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                          inquiry.status,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {formatEnum(inquiry.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {formatDate(inquiry.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(inquiry)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => openUpdateModal(inquiry)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Update
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuickStatusChange(inquiry)
                          }
                          className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                        >
                          {inquiry.status === "OPEN"
                            ? "Start"
                            : inquiry.status === "IN_PROGRESS"
                              ? "Resolve"
                              : "Reopen"}
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === inquiry.id}
                          onClick={() =>
                            handleDeleteInquiry(inquiry)
                          }
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === inquiry.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && visibleInquiries.length === 0 && (
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
              filteredInquiries.length,
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
              (_, index) => index + 1,
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
                  Math.min(totalPages, page + 1),
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

      {createModalOpen && (
        <CreateInquiryModal
          form={createForm}
          creating={creating}
          onChange={handleCreateChange}
          onSubmit={handleCreateInquiry}
          onClose={() => {
            if (!creating) {
              setCreateModalOpen(false);
            }
          }}
        />
      )}

      {viewModalOpen && selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedInquiry(null);
          }}
        />
      )}

      {updateModalOpen && selectedInquiry && (
        <UpdateInquiryModal
          inquiry={selectedInquiry}
          form={updateForm}
          updating={updating}
          onChange={handleUpdateChange}
          onSubmit={handleUpdateInquiry}
          onClose={() => {
            if (!updating) {
              setUpdateModalOpen(false);
              setSelectedInquiry(null);
            }
          }}
        />
      )}
    </div>
  );
}

function CreateInquiryModal({
  form,
  creating,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      title="New Inquiry"
      subtitle="Create a new customer inquiry."
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Customer Name" required>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="form-input"
              required
            />
          </FormField>

          <FormField label="Email" required>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="form-input"
              required
            />
          </FormField>

          <FormField label="Contact Number" required>
            <input
              name="contactNo"
              value={form.contactNo}
              onChange={onChange}
              className="form-input"
              required
            />
          </FormField>

          <FormField label="Category" required>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="form-input"
              required
            >
              <option value="GENERAL">General</option>
              <option value="DELIVERY">Delivery</option>
              <option value="TRACKING">Tracking</option>
              <option value="BILLING">Billing</option>
              <option value="PAYMENT">Payment</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Subject" required>
              <input
                name="subject"
                value={form.subject}
                onChange={onChange}
                className="form-input"
                required
              />
            </FormField>
          </div>

          <FormField label="Priority" required>
            <select
              name="priority"
              value={form.priority}
              onChange={onChange}
              className="form-input"
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Message" required>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows="5"
                className="form-input resize-none"
                required
              />
            </FormField>
          </div>
        </div>

        <ModalActions
          submitting={creating}
          submitText="Submit Inquiry"
          submittingText="Submitting..."
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}

function UpdateInquiryModal({
  inquiry,
  form,
  updating,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      title="Update Inquiry"
      subtitle={`Inquiry: ${inquiry.inquiryNo}`}
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">
            {inquiry.subject}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {inquiry.message}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" required>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="form-input"
              required
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </FormField>

          <FormField label="Priority" required>
            <select
              name="priority"
              value={form.priority}
              onChange={onChange}
              className="form-input"
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Assigned To">
              <input
                name="assignedTo"
                value={form.assignedTo}
                onChange={onChange}
                placeholder="e.g. Customer Service Team"
                className="form-input"
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField label="Response">
              <textarea
                name="response"
                value={form.response}
                onChange={onChange}
                rows="5"
                className="form-input resize-none"
                placeholder="Enter the response or resolution..."
              />
            </FormField>
          </div>
        </div>

        <ModalActions
          submitting={updating}
          submitText="Save Changes"
          submittingText="Saving..."
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}

function InquiryDetailsModal({ inquiry, onClose }) {
  return (
    <Modal
      title="Inquiry Details"
      subtitle={`Inquiry: ${inquiry.inquiryNo}`}
      onClose={onClose}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailItem label="Customer" value={inquiry.name} />

        <DetailItem label="Email" value={inquiry.email} />

        <DetailItem
          label="Contact Number"
          value={inquiry.contactNo}
        />

        <DetailItem
          label="Category"
          value={formatEnum(inquiry.category)}
        />

        <DetailItem
          label="Priority"
          value={formatEnum(inquiry.priority)}
        />

        <DetailItem
          label="Status"
          value={formatEnum(inquiry.status)}
        />

        <DetailItem
          label="Assigned To"
          value={inquiry.assignedTo}
        />

        <DetailItem
          label="Created"
          value={formatDate(inquiry.createdAt)}
        />

        <DetailItem
          label="Subject"
          value={inquiry.subject}
          fullWidth
        />

        <DetailItem
          label="Customer Message"
          value={inquiry.message}
          fullWidth
        />

        <DetailItem
          label="Response"
          value={inquiry.response || "No response added yet."}
          fullWidth
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

function ModalActions({
  submitting,
  submitText,
  submittingText,
  onClose,
}) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? submittingText : submitText}
      </button>
    </div>
  );
}

function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, iconClasses }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClasses}`}
      >
        <span className="material-symbols-outlined block text-[20px] leading-none">
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