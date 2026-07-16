import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";

const PAGE_SIZE = 5;

const EMPTY_FORM = {
  recipientEmail: "",
  title: "",
  message: "",
  type: "INFO",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(value = "") {
  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeNotification(notification) {
  return {
    ...notification,
    id: notification.id,
    recipientEmail: notification.recipientEmail || "Not provided",
    title: notification.title || "Untitled notification",
    message: notification.message || "",
    type: notification.type || "INFO",
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt || null,
    updatedAt: notification.updatedAt || null,
  };
}

function typeMeta(type) {
  switch (String(type).toUpperCase()) {
    case "SUCCESS":
      return {
        icon: "check_circle",
        iconClasses: "bg-emerald-100 text-emerald-700",
        badgeClasses: "bg-emerald-100 text-emerald-700",
      };

    case "WARNING":
      return {
        icon: "warning",
        iconClasses: "bg-amber-100 text-amber-700",
        badgeClasses: "bg-amber-100 text-amber-700",
      };

    case "ERROR":
      return {
        icon: "error",
        iconClasses: "bg-rose-100 text-rose-700",
        badgeClasses: "bg-rose-100 text-rose-700",
      };

    default:
      return {
        icon: "notifications",
        iconClasses: "bg-sky-100 text-sky-700",
        badgeClasses: "bg-sky-100 text-sky-700",
      };
  }
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [markingReadId, setMarkingReadId] = useState("");

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  async function loadNotifications() {
    setLoading(true);
    setPageError("");

    try {
      const response = await apiRequest("/notifications");

      const list = Array.isArray(response.notifications)
        ? response.notifications.map(normalizeNotification)
        : [];

      setNotifications(list);
    } catch (error) {
      console.error("Failed to load notifications:", error);

      setPageError(
        error.message ||
          "Failed to load notifications. Check whether the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !query ||
        notification.title.toLowerCase().includes(query) ||
        notification.recipientEmail.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        notification.type === typeFilter;

      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && notification.isRead) ||
        (readFilter === "UNREAD" && !notification.isRead);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, search, typeFilter, readFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE),
  );

  const visibleNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statistics = useMemo(() => {
    const total = notifications.length;
    const read = notifications.filter(
      (notification) => notification.isRead,
    ).length;
    const unread = total - read;
    const success = notifications.filter(
      (notification) => notification.type === "SUCCESS",
    ).length;

    return {
      total,
      read,
      unread,
      success,
    };
  }, [notifications]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetMessages() {
    setPageError("");
    setSuccessMessage("");
  }

  function openCreateModal() {
    resetMessages();
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  }

  async function handleCreate(event) {
    event.preventDefault();

    setSending(true);
    resetMessages();

    try {
      await apiRequest("/notifications", {
        method: "POST",
        body: JSON.stringify({
          recipientEmail: form.recipientEmail.trim(),
          title: form.title.trim(),
          message: form.message.trim(),
          type: form.type,
        }),
      });

      setSuccessMessage("Notification created successfully.");
      setForm(EMPTY_FORM);
      setCreateOpen(false);

      await loadNotifications();
    } catch (error) {
      setPageError(
        error.message || "Failed to create notification.",
      );
    } finally {
      setSending(false);
    }
  }

  async function openView(notification) {
    resetMessages();

    try {
      const response = await apiRequest(
        `/notifications/${notification.id}`,
      );

      setSelectedNotification(
        normalizeNotification(
          response.notification || notification,
        ),
      );

      setViewOpen(true);
    } catch (error) {
      setPageError(
        error.message || "Failed to load notification details.",
      );
    }
  }

  function openEdit(notification) {
    resetMessages();
    setSelectedNotification(notification);

    setEditForm({
      recipientEmail: notification.recipientEmail,
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    setEditOpen(true);
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!selectedNotification?.id) return;

    setUpdating(true);
    resetMessages();

    try {
      await apiRequest(
        `/notifications/${selectedNotification.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: editForm.title.trim(),
            message: editForm.message.trim(),
            type: editForm.type,
            isRead: selectedNotification.isRead,
          }),
        },
      );

      setSuccessMessage("Notification updated successfully.");
      setEditOpen(false);
      setSelectedNotification(null);

      await loadNotifications();
    } catch (error) {
      setPageError(
        error.message || "Failed to update notification.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleMarkRead(notification) {
    if (notification.isRead) return;

    setMarkingReadId(notification.id);
    resetMessages();

    try {
      await apiRequest(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        },
      );

      setSuccessMessage("Notification marked as read.");

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item,
        ),
      );
    } catch (error) {
      setPageError(
        error.message ||
          "Failed to mark notification as read.",
      );
    } finally {
      setMarkingReadId("");
    }
  }

  async function handleDelete(notification) {
    const confirmed = window.confirm(
      `Delete notification "${notification.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(notification.id);
    resetMessages();

    try {
      await apiRequest(`/notifications/${notification.id}`, {
        method: "DELETE",
      });

      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id),
      );

      setSuccessMessage("Notification deleted successfully.");
    } catch (error) {
      setPageError(
        error.message || "Failed to delete notification.",
      );
    } finally {
      setDeletingId("");
    }
  }

  function exportCSV() {
    const headings = [
      "Recipient Email",
      "Title",
      "Message",
      "Type",
      "Read Status",
      "Created",
      "Updated",
    ];

    const rows = filteredNotifications.map((notification) => [
      notification.recipientEmail,
      notification.title,
      notification.message,
      formatType(notification.type),
      notification.isRead ? "Read" : "Unread",
      formatDate(notification.createdAt),
      formatDate(notification.updatedAt),
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
    link.download = "notifications.csv";

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
            Notification Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, review, update, and manage customer notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          Create Notification
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
            onClick={loadNotifications}
            className="w-fit rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold hover:bg-rose-100"
          >
            Try Again
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="notifications"
          label="Total Notifications"
          value={statistics.total}
          iconClasses="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon="mark_email_unread"
          label="Unread"
          value={statistics.unread}
          iconClasses="bg-amber-100 text-amber-700"
        />

        <StatCard
          icon="done_all"
          label="Read"
          value={statistics.read}
          iconClasses="bg-violet-100 text-violet-700"
        />

        <StatCard
          icon="check_circle"
          label="Success Notifications"
          value={statistics.success}
          iconClasses="bg-emerald-100 text-emerald-700"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                placeholder="Search by title, recipient, or message..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              <option value="ALL">All types</option>
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
            </select>

            <select
              value={readFilter}
              onChange={(event) => {
                setReadFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>

            <button
              type="button"
              onClick={exportCSV}
              disabled={filteredNotifications.length === 0}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>

          <div>
            {loading && (
              <div className="px-5 py-14 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            )}

            {!loading &&
              visibleNotifications.map((notification) => {
                const meta = typeMeta(notification.type);

                return (
                  <article
                    key={notification.id}
                    className={`flex gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 ${
                      notification.isRead
                        ? "bg-white"
                        : "bg-sky-50/40"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconClasses}`}
                    >
                      <span className="material-symbols-outlined text-[20px] leading-none">
                        {meta.icon}
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

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openView(notification)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(notification)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          {!notification.isRead && (
                            <button
                              type="button"
                              disabled={
                                markingReadId === notification.id
                              }
                              onClick={() =>
                                handleMarkRead(notification)
                              }
                              className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                            >
                              {markingReadId === notification.id
                                ? "Saving..."
                                : "Mark Read"}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={deletingId === notification.id}
                            onClick={() =>
                              handleDelete(notification)
                            }
                            className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {deletingId === notification.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{notification.recipientEmail}</span>
                        <span>•</span>
                        <span>{formatDate(notification.createdAt)}</span>

                        <span
                          className={`rounded-full px-2.5 py-1 font-semibold ${meta.badgeClasses}`}
                        >
                          {formatType(notification.type)}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 font-semibold ${
                            notification.isRead
                              ? "bg-slate-200 text-slate-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {notification.isRead ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}

            {!loading && visibleNotifications.length === 0 && (
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
                filteredNotifications.length,
              )}{" "}
              of {filteredNotifications.length} notifications
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
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
            Compose and send a customer notification directly.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <Field label="Recipient Email" required>
              <input
                type="email"
                name="recipientEmail"
                value={form.recipientEmail}
                onChange={handleFormChange}
                placeholder="customer@example.com"
                className="form-input"
                required
              />
            </Field>

            <Field label="Title" required>
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Enter notification title"
                className="form-input"
                required
              />
            </Field>

            <Field label="Type" required>
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className="form-input"
              >
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </select>
            </Field>

            <Field label="Message" required>
              <textarea
                name="message"
                value={form.message}
                onChange={handleFormChange}
                placeholder="Write the notification message..."
                rows="5"
                className="form-input resize-none"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </form>
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

      {createOpen && (
        <Modal
          title="Create Notification"
          subtitle="Send a notification to a customer email address."
          onClose={() => !sending && setCreateOpen(false)}
        >
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <Field label="Recipient Email" required>
                <input
                  type="email"
                  name="recipientEmail"
                  value={form.recipientEmail}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Title" required>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Type" required>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="form-input"
                >
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                </select>
              </Field>

              <Field label="Message" required>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleFormChange}
                  rows="5"
                  className="form-input resize-none"
                  required
                />
              </Field>
            </div>

            <ModalButtons
              loading={sending}
              onCancel={() => setCreateOpen(false)}
              submitText="Create Notification"
            />
          </form>
        </Modal>
      )}

      {editOpen && selectedNotification && (
        <Modal
          title="Edit Notification"
          subtitle={`Recipient: ${selectedNotification.recipientEmail}`}
          onClose={() => !updating && setEditOpen(false)}
        >
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              <Field label="Recipient Email">
                <input
                  value={editForm.recipientEmail}
                  className="form-input bg-slate-100"
                  disabled
                />
              </Field>

              <Field label="Title" required>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                />
              </Field>

              <Field label="Type" required>
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                  className="form-input"
                >
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                </select>
              </Field>

              <Field label="Message" required>
                <textarea
                  name="message"
                  value={editForm.message}
                  onChange={handleEditChange}
                  rows="5"
                  className="form-input resize-none"
                  required
                />
              </Field>
            </div>

            <ModalButtons
              loading={updating}
              onCancel={() => setEditOpen(false)}
              submitText="Save Changes"
            />
          </form>
        </Modal>
      )}

      {viewOpen && selectedNotification && (
        <Modal
          title="Notification Details"
          subtitle={selectedNotification.title}
          onClose={() => {
            setViewOpen(false);
            setSelectedNotification(null);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Recipient Email"
              value={selectedNotification.recipientEmail}
            />

            <Detail
              label="Type"
              value={formatType(selectedNotification.type)}
            />

            <Detail
              label="Read Status"
              value={
                selectedNotification.isRead ? "Read" : "Unread"
              }
            />

            <Detail
              label="Created"
              value={formatDate(selectedNotification.createdAt)}
            />

            <Detail
              label="Updated"
              value={formatDate(selectedNotification.updatedAt)}
            />

            <Detail
              label="Title"
              value={selectedNotification.title}
              full
            />

            <Detail
              label="Message"
              value={selectedNotification.message}
              full
            />
          </div>
        </Modal>
      )}
    </div>
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
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
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

function ModalButtons({ loading, onCancel, submitText }) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
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
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}
