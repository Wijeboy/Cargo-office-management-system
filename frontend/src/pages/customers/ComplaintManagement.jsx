import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";

const PAGE_SIZE = 5;

const EMPTY_CREATE_FORM = {
  name: "",
  email: "",
  contactNo: "",
  subject: "",
  description: "",
  category: "GENERAL",
  priority: "MEDIUM",
};

const EMPTY_UPDATE_FORM = {
  status: "OPEN",
  priority: "MEDIUM",
  assignedTo: "",
  resolutionNote: "",
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
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeComplaint(complaint) {
  return {
    ...complaint,
    id: complaint.id,

    complaintNo:
      complaint.complaintNo ||
      complaint.complaintId ||
      complaint.id,

    name:
      complaint.name ||
      complaint.customer?.name ||
      "Unknown Customer",

    email:
      complaint.email ||
      complaint.customer?.email ||
      "Not provided",

    contactNo:
      complaint.contactNo ||
      complaint.customer?.contactNo ||
      "Not provided",

    subject: complaint.subject || "No subject",

    description:
      complaint.description ||
      complaint.message ||
      "",

    category: complaint.category || "GENERAL",
    priority: complaint.priority || "MEDIUM",
    status: complaint.status || "OPEN",

    assignedTo:
      complaint.assignedTo ||
      "Unassigned",

    resolutionNote:
      complaint.resolutionNote ||
      complaint.response ||
      "",

    createdAt: complaint.createdAt || null,
    updatedAt: complaint.updatedAt || null,
  };
}

function priorityClasses(priority) {
  switch (String(priority).toUpperCase()) {
    case "URGENT":
      return "bg-rose-100 text-rose-700";

    case "HIGH":
      return "bg-red-100 text-red-700";

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
      return "bg-rose-100 text-rose-700";

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

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [updateForm, setUpdateForm] = useState(EMPTY_UPDATE_FORM);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [changingStatusId, setChangingStatusId] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setPageError("");

    try {
      const response = await apiRequest("/complaints");

      const list = Array.isArray(response.complaints)
        ? response.complaints.map(normalizeComplaint)
        : [];

      setComplaints(list);
    } catch (error) {
      console.error("Failed to load complaints:", error);

      setPageError(
        error.message ||
          "Failed to load complaints. Check whether the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const value = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !value ||
        complaint.complaintNo.toLowerCase().includes(value) ||
        complaint.name.toLowerCase().includes(value) ||
        complaint.email.toLowerCase().includes(value) ||
        complaint.subject.toLowerCase().includes(value) ||
        complaint.category.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        complaint.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, search, statusFilter, priorityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredComplaints.length / PAGE_SIZE),
  );

  const visibleComplaints = filteredComplaints.slice(
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

    const resolvedThisMonth = complaints.filter((complaint) => {
      if (
        complaint.status !== "RESOLVED" ||
        !complaint.updatedAt
      ) {
        return false;
      }

      const updatedDate = new Date(complaint.updatedAt);

      return (
        updatedDate.getMonth() === now.getMonth() &&
        updatedDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      total: complaints.length,

      open: complaints.filter(
        (complaint) => complaint.status === "OPEN",
      ).length,

      inProgress: complaints.filter(
        (complaint) => complaint.status === "IN_PROGRESS",
      ).length,

      highPriority: complaints.filter(
        (complaint) =>
          complaint.priority === "HIGH" ||
          complaint.priority === "URGENT",
      ).length,

      resolvedThisMonth,
    };
  }, [complaints]);

  function handleCreateChange(event) {
    const { name, value } = event.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleUpdateChange(event) {
    const { name, value } = event.target;

    setUpdateForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function openViewModal(complaint) {
    setPageError("");

    try {
      const response = await apiRequest(
        `/complaints/${complaint.id}`,
      );

      setSelectedComplaint(
        normalizeComplaint(response.complaint || complaint),
      );

      setViewModalOpen(true);
    } catch (error) {
      setPageError(
        error.message ||
          "Failed to load complaint details.",
      );
    }
  }

  function openUpdateModal(complaint) {
    setSelectedComplaint(complaint);

    setUpdateForm({
      status: complaint.status,
      priority: complaint.priority,

      assignedTo:
        complaint.assignedTo === "Unassigned"
          ? ""
          : complaint.assignedTo,

      resolutionNote: complaint.resolutionNote || "",
    });

    setUpdateModalOpen(true);
  }

  async function handleCreateComplaint(event) {
    event.preventDefault();

    setCreating(true);
    setPageError("");
    setSuccessMessage("");

    const payload = {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      contactNo: createForm.contactNo.trim(),
      subject: createForm.subject.trim(),
      description: createForm.description.trim(),
      category: createForm.category,
      priority: createForm.priority,
    };

    try {
      await apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCreateModalOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      setSuccessMessage("Complaint submitted successfully.");

      await loadComplaints();
    } catch (error) {
      setPageError(
        error.message ||
          "Failed to submit complaint.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateComplaint(event) {
    event.preventDefault();

    if (!selectedComplaint?.id) return;

    setUpdating(true);
    setPageError("");
    setSuccessMessage("");

    const payload = {
      status: updateForm.status,
      priority: updateForm.priority,

      assignedTo:
        updateForm.assignedTo.trim() || null,

      resolutionNote:
        updateForm.resolutionNote.trim() || null,
    };

    try {
      await apiRequest(
        `/complaints/${selectedComplaint.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      setUpdateModalOpen(false);
      setSelectedComplaint(null);
      setSuccessMessage("Complaint updated successfully.");

      await loadComplaints();
    } catch (error) {
      setPageError(
        error.message ||
          "Failed to update complaint.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleQuickStatusChange(complaint) {
    let nextStatus = "IN_PROGRESS";

    if (complaint.status === "IN_PROGRESS") {
      nextStatus = "RESOLVED";
    } else if (
      complaint.status === "RESOLVED" ||
      complaint.status === "CLOSED"
    ) {
      nextStatus = "OPEN";
    }

    setChangingStatusId(complaint.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/complaints/${complaint.id}`, {
        method: "PUT",

        body: JSON.stringify({
          status: nextStatus,
          priority: complaint.priority,

          assignedTo:
            complaint.assignedTo === "Unassigned"
              ? null
              : complaint.assignedTo,

          resolutionNote:
            complaint.resolutionNote || null,
        }),
      });

      setSuccessMessage(
        `Complaint status changed to ${formatEnum(nextStatus)}.`,
      );

      await loadComplaints();
    } catch (error) {
      setPageError(
        error.message ||
          "Failed to change complaint status.",
      );
    } finally {
      setChangingStatusId("");
    }
  }

  async function handleDeleteComplaint(complaint) {
    const confirmed = window.confirm(
      `Are you sure you want to delete complaint "${complaint.complaintNo}"?`,
    );

    if (!confirmed) return;

    setDeletingId(complaint.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/complaints/${complaint.id}`, {
        method: "DELETE",
      });

      setComplaints((current) =>
        current.filter((item) => item.id !== complaint.id),
      );

      setSuccessMessage("Complaint deleted successfully.");
    } catch (error) {
      setPageError(
        error.message ||
          "Failed to delete complaint.",
      );
    } finally {
      setDeletingId("");
    }
  }

  function exportCSV() {
    const headings = [
      "Complaint Number",
      "Subject",
      "Customer",
      "Email",
      "Contact Number",
      "Category",
      "Priority",
      "Assigned To",
      "Status",
      "Resolution Note",
      "Created",
    ];

    const rows = filteredComplaints.map((complaint) => [
      complaint.complaintNo,
      complaint.subject,
      complaint.name,
      complaint.email,
      complaint.contactNo,
      formatEnum(complaint.category),
      formatEnum(complaint.priority),
      complaint.assignedTo,
      formatEnum(complaint.status),
      complaint.resolutionNote,
      formatDate(complaint.createdAt),
    ]);

    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "complaints.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Complaint Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Investigate, assign, prioritize, and resolve customer complaints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateForm(EMPTY_CREATE_FORM);
            setCreateModalOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
        >
          <span className="text-xl">+</span>
          New Complaint
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {pageError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{pageError}</span>

          <button
            type="button"
            onClick={loadComplaints}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Complaints" value={statistics.total} />
        <StatCard label="Open Complaints" value={statistics.open} />
        <StatCard label="In Progress" value={statistics.inProgress} />
        <StatCard label="High Priority" value={statistics.highPriority} />
        <StatCard
          label="Resolved This Month"
          value={statistics.resolvedThisMonth}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_170px_170px_120px]">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search complaints..."
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
          >
            <option value="ALL">All statuses</option>
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
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm"
          >
            <option value="ALL">All priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredComplaints.length === 0}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Complaint",
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
                    className="border-b border-slate-200 px-5 py-4 text-left text-xs font-bold uppercase text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    Loading complaints...
                  </td>
                </tr>
              )}

              {!loading &&
                visibleComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        #{complaint.complaintNo}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {complaint.subject}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                          {getInitials(complaint.name)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {complaint.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {complaint.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {formatEnum(complaint.category)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(
                          complaint.priority,
                        )}`}
                      >
                        {formatEnum(complaint.priority)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {complaint.assignedTo}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                          complaint.status,
                        )}`}
                      >
                        {formatEnum(complaint.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {formatDate(complaint.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(complaint)}
                          className="rounded-lg border px-3 py-2 text-xs font-semibold"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => openUpdateModal(complaint)}
                          className="rounded-lg border px-3 py-2 text-xs font-semibold"
                        >
                          Update
                        </button>

                        <button
                          type="button"
                          disabled={changingStatusId === complaint.id}
                          onClick={() =>
                            handleQuickStatusChange(complaint)
                          }
                          className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 disabled:opacity-50"
                        >
                          {complaint.status === "OPEN"
                            ? "Start"
                            : complaint.status === "IN_PROGRESS"
                              ? "Resolve"
                              : "Reopen"}
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === complaint.id}
                          onClick={() =>
                            handleDeleteComplaint(complaint)
                          }
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-50"
                        >
                          {deletingId === complaint.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && visibleComplaints.length === 0 && (
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

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredComplaints.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            –{Math.min(currentPage * PAGE_SIZE, filteredComplaints.length)} of{" "}
            {filteredComplaints.length}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              className="h-9 w-9 rounded-lg border disabled:opacity-40"
            >
              ‹
            </button>

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
              {currentPage}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1),
                )
              }
              className="h-9 w-9 rounded-lg border disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {createModalOpen && (
        <Modal
          title="New Complaint"
          onClose={() => !creating && setCreateModalOpen(false)}
        >
          <form onSubmit={handleCreateComplaint}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Customer Name"
                name="name"
                value={createForm.name}
                onChange={handleCreateChange}
                required
              />

              <InputField
                label="Email"
                type="email"
                name="email"
                value={createForm.email}
                onChange={handleCreateChange}
                required
              />

              <InputField
                label="Contact Number"
                name="contactNo"
                value={createForm.contactNo}
                onChange={handleCreateChange}
                required
              />

              <SelectField
                label="Category"
                name="category"
                value={createForm.category}
                onChange={handleCreateChange}
                options={[
                  "GENERAL",
                  "DAMAGE",
                  "DELAY",
                  "DELIVERY",
                  "SERVICE",
                  "BILLING",
                  "OTHER",
                ]}
              />

              <div className="sm:col-span-2">
                <InputField
                  label="Subject"
                  name="subject"
                  value={createForm.subject}
                  onChange={handleCreateChange}
                  required
                />
              </div>

              <SelectField
                label="Priority"
                name="priority"
                value={createForm.priority}
                onChange={handleCreateChange}
                options={["LOW", "MEDIUM", "HIGH", "URGENT"]}
              />

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Description"
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateChange}
                  required
                />
              </div>
            </div>

            <ModalButtons
              loading={creating}
              onCancel={() => setCreateModalOpen(false)}
              submitText="Submit Complaint"
            />
          </form>
        </Modal>
      )}

      {updateModalOpen && selectedComplaint && (
        <Modal
          title="Update Complaint"
          onClose={() => !updating && setUpdateModalOpen(false)}
        >
          <form onSubmit={handleUpdateComplaint}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Status"
                name="status"
                value={updateForm.status}
                onChange={handleUpdateChange}
                options={[
                  "OPEN",
                  "IN_PROGRESS",
                  "RESOLVED",
                  "CLOSED",
                ]}
              />

              <SelectField
                label="Priority"
                name="priority"
                value={updateForm.priority}
                onChange={handleUpdateChange}
                options={["LOW", "MEDIUM", "HIGH", "URGENT"]}
              />

              <div className="sm:col-span-2">
                <InputField
                  label="Assigned To"
                  name="assignedTo"
                  value={updateForm.assignedTo}
                  onChange={handleUpdateChange}
                />
              </div>

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Resolution Note"
                  name="resolutionNote"
                  value={updateForm.resolutionNote}
                  onChange={handleUpdateChange}
                />
              </div>
            </div>

            <ModalButtons
              loading={updating}
              onCancel={() => setUpdateModalOpen(false)}
              submitText="Save Changes"
            />
          </form>
        </Modal>
      )}

      {viewModalOpen && selectedComplaint && (
        <Modal
          title="Complaint Details"
          onClose={() => setViewModalOpen(false)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Complaint No" value={selectedComplaint.complaintNo} />
            <Detail label="Customer" value={selectedComplaint.name} />
            <Detail label="Email" value={selectedComplaint.email} />
            <Detail label="Contact" value={selectedComplaint.contactNo} />
            <Detail label="Category" value={formatEnum(selectedComplaint.category)} />
            <Detail label="Priority" value={formatEnum(selectedComplaint.priority)} />
            <Detail label="Status" value={formatEnum(selectedComplaint.status)} />
            <Detail label="Assigned To" value={selectedComplaint.assignedTo} />
            <Detail label="Subject" value={selectedComplaint.subject} full />
            <Detail label="Description" value={selectedComplaint.description} full />
            <Detail
              label="Resolution Note"
              value={
                selectedComplaint.resolutionNote ||
                "No resolution note has been added."
              }
              full
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </article>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-xl font-bold">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-500"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-slate-200 px-4"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatEnum(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows="5"
        className="w-full rounded-xl border border-slate-200 p-4 outline-none"
      />
    </label>
  );
}

function ModalButtons({
  loading,
  onCancel,
  submitText,
}) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t pt-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : submitText}
      </button>
    </div>
  );
}

function Detail({ label, value, full = false }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-bold uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold">
        {value || "Not provided"}
      </p>
    </div>
  );
}