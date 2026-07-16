import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";

const PAGE_SIZE = 4;

const EMPTY_FORM = {
  name: "",
  email: "",
  contactNo: "",
  rating: 5,
  comment: "",
  category: "GENERAL",
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

function getSentiment(rating) {
  const numericRating = Number(rating);

  if (numericRating >= 4) return "Positive";
  if (numericRating === 3) return "Neutral";
  return "Negative";
}

function sentimentClasses(sentiment) {
  switch (sentiment) {
    case "Positive":
      return "bg-emerald-100 text-emerald-700";
    case "Neutral":
      return "bg-amber-100 text-amber-700";
    case "Negative":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusClasses(status) {
  switch (String(status).toUpperCase()) {
    case "NEW":
      return "bg-amber-100 text-amber-700";
    case "REVIEWED":
      return "bg-sky-100 text-sky-700";
    case "FOLLOW_UP":
      return "bg-violet-100 text-violet-700";
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
  ];

  return styles[index % styles.length];
}

function normalizeFeedback(item) {
  return {
    ...item,
    id: item.id,
    feedbackNo: item.feedbackNo || item.id,
    name: item.name || item.customer?.name || "Unknown Customer",
    email: item.email || item.customer?.email || "Not provided",
    contactNo:
      item.contactNo || item.customer?.contactNo || "Not provided",
    rating: Number(item.rating) || 0,
    comment: item.comment || "",
    category: item.category || "GENERAL",
    status: item.status || "NEW",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
}

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [updateForm, setUpdateForm] = useState({
    status: "NEW",
    rating: 5,
    comment: "",
  });

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [changingStatusId, setChangingStatusId] = useState("");

  async function loadFeedback() {
    setLoading(true);
    setPageError("");

    try {
      const response = await apiRequest("/feedback");

      const list = Array.isArray(response.feedback)
        ? response.feedback.map(normalizeFeedback)
        : [];

      setFeedback(list);
    } catch (error) {
      console.error("Failed to load feedback:", error);

      setPageError(
        error.message ||
          "Failed to load feedback. Check whether the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase();

    return feedback.filter((item) => {
      const sentiment = getSentiment(item.rating);

      const matchesSearch =
        !query ||
        item.feedbackNo.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.comment.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesRating =
        ratingFilter === "ALL" ||
        item.rating === Number(ratingFilter);

      const matchesSentiment =
        sentimentFilter === "ALL" ||
        sentiment === sentimentFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesRating &&
        matchesSentiment &&
        matchesStatus
      );
    });
  }, [
    feedback,
    search,
    ratingFilter,
    sentimentFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeedback.length / PAGE_SIZE),
  );

  const visibleFeedback = filteredFeedback.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statistics = useMemo(() => {
    const total = feedback.length;

    const average =
      total === 0
        ? 0
        : feedback.reduce((sum, item) => sum + item.rating, 0) /
          total;

    const positive = feedback.filter(
      (item) => getSentiment(item.rating) === "Positive",
    ).length;

    const negative = feedback.filter(
      (item) => getSentiment(item.rating) === "Negative",
    ).length;

    const now = new Date();

    const thisMonth = feedback.filter((item) => {
      if (!item.createdAt) return false;

      const created = new Date(item.createdAt);

      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      average: average.toFixed(1),
      positivePercent:
        total === 0 ? 0 : Math.round((positive / total) * 100),
      negativePercent:
        total === 0 ? 0 : Math.round((negative / total) * 100),
      thisMonth,
    };
  }, [feedback]);

  function handleCreateChange(event) {
    const { name, value } = event.target;

    setCreateForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  }

  function handleUpdateChange(event) {
    const { name, value } = event.target;

    setUpdateForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  }

  async function openView(item) {
    setPageError("");

    try {
      const response = await apiRequest(`/feedback/${item.id}`);

      setSelectedFeedback(
        normalizeFeedback(response.feedback || item),
      );

      setViewOpen(true);
    } catch (error) {
      setPageError(
        error.message || "Failed to load feedback details.",
      );
    }
  }

  function openUpdate(item) {
    setSelectedFeedback(item);

    setUpdateForm({
      status: item.status,
      rating: item.rating,
      comment: item.comment,
    });

    setUpdateOpen(true);
  }

  async function handleCreate(event) {
    event.preventDefault();

    setCreating(true);
    setPageError("");
    setSuccessMessage("");

    const payload = {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      contactNo: createForm.contactNo.trim(),
      rating: Number(createForm.rating),
      comment: createForm.comment.trim(),
      category: createForm.category,
    };

    try {
      await apiRequest("/feedback", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      setSuccessMessage("Feedback submitted successfully.");

      await loadFeedback();
    } catch (error) {
      setPageError(
        error.message || "Failed to submit feedback.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!selectedFeedback?.id) return;

    setUpdating(true);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/feedback/${selectedFeedback.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: updateForm.status,
          rating: Number(updateForm.rating),
          comment: updateForm.comment.trim(),
        }),
      });

      setUpdateOpen(false);
      setSelectedFeedback(null);
      setSuccessMessage("Feedback updated successfully.");

      await loadFeedback();
    } catch (error) {
      setPageError(
        error.message || "Failed to update feedback.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleQuickStatus(item) {
    const nextStatus =
      item.status === "NEW" ? "REVIEWED" : "NEW";

    setChangingStatusId(item.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/feedback/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: nextStatus,
          rating: item.rating,
          comment: item.comment,
        }),
      });

      setSuccessMessage(
        `Feedback marked as ${formatEnum(nextStatus)}.`,
      );

      await loadFeedback();
    } catch (error) {
      setPageError(
        error.message || "Failed to change feedback status.",
      );
    } finally {
      setChangingStatusId("");
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete feedback "${item.feedbackNo}"?`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/feedback/${item.id}`, {
        method: "DELETE",
      });

      setFeedback((current) =>
        current.filter((record) => record.id !== item.id),
      );

      setSuccessMessage("Feedback deleted successfully.");
    } catch (error) {
      setPageError(
        error.message || "Failed to delete feedback.",
      );
    } finally {
      setDeletingId("");
    }
  }

  function exportCSV() {
    const headings = [
      "Feedback Number",
      "Customer",
      "Email",
      "Contact Number",
      "Rating",
      "Comment",
      "Category",
      "Sentiment",
      "Status",
      "Submitted",
    ];

    const rows = filteredFeedback.map((item) => [
      item.feedbackNo,
      item.name,
      item.email,
      item.contactNo,
      item.rating,
      item.comment,
      formatEnum(item.category),
      getSentiment(item.rating),
      formatEnum(item.status),
      formatDate(item.createdAt),
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
    link.download = "feedback.csv";

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
            Feedback Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review customer ratings, identify service trends, and manage
            follow-up actions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateForm(EMPTY_FORM);
            setCreateOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          Add Feedback
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
            onClick={loadFeedback}
            className="w-fit rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold hover:bg-rose-100"
          >
            Try Again
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="star"
          label="Average Rating"
          value={`${statistics.average} / 5`}
          iconClasses="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon="check"
          label="Positive Feedback"
          value={`${statistics.positivePercent}%`}
          iconClasses="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          icon="priority_high"
          label="Negative Feedback"
          value={`${statistics.negativePercent}%`}
          iconClasses="bg-rose-100 text-rose-700"
        />

        <StatCard
          icon="schedule"
          label="Feedback This Month"
          value={statistics.thisMonth}
          iconClasses="bg-amber-100 text-amber-700"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 xl:grid-cols-[1fr_130px_150px_150px_120px]">
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
              placeholder="Search by feedback number, customer, category, or comment..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) => {
              setRatingFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(event) => {
              setSentimentFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">All sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredFeedback.length === 0}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {loading && (
            <div className="col-span-full py-12 text-center text-sm text-slate-500">
              Loading feedback...
            </div>
          )}

          {!loading &&
            visibleFeedback.map((item, index) => {
              const sentiment = getSentiment(item.rating);

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClasses(
                          index,
                        )}`}
                      >
                        {getInitials(item.name)}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.email}
                        </p>
                      </div>
                    </div>

                    <StarRating rating={item.rating} />
                  </div>

                  <p className="mt-5 min-h-[54px] text-sm leading-6 text-slate-600">
                    “{item.comment}”
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <InfoBox
                      label="Feedback No"
                      value={item.feedbackNo}
                    />

                    <InfoBox
                      label="Submitted"
                      value={formatDate(item.createdAt)}
                    />

                    <InfoBox
                      label="Category"
                      value={formatEnum(item.category)}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${sentimentClasses(
                        sentiment,
                      )}`}
                    >
                      {sentiment}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        item.status,
                      )}`}
                    >
                      {formatEnum(item.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => openView(item)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => openUpdate(item)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Update
                    </button>

                    <button
                      type="button"
                      disabled={changingStatusId === item.id}
                      onClick={() => handleQuickStatus(item)}
                      className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                    >
                      {changingStatusId === item.id
                        ? "Saving..."
                        : item.status === "NEW"
                          ? "Mark Reviewed"
                          : "Mark New"}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item)}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {deletingId === item.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}

          {!loading && visibleFeedback.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-slate-500">
              No feedback records found.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            {filteredFeedback.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredFeedback.length,
            )}{" "}
            of {filteredFeedback.length} feedback records
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
          title="Add Feedback"
          subtitle="Create a new customer feedback record."
          onClose={() => !creating && setCreateOpen(false)}
        >
          <form onSubmit={handleCreate}>
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
                label="Rating"
                name="rating"
                value={createForm.rating}
                onChange={handleCreateChange}
                options={[
                  { value: 5, label: "5 stars" },
                  { value: 4, label: "4 stars" },
                  { value: 3, label: "3 stars" },
                  { value: 2, label: "2 stars" },
                  { value: 1, label: "1 star" },
                ]}
              />

              <SelectField
                label="Category"
                name="category"
                value={createForm.category}
                onChange={handleCreateChange}
                options={[
                  { value: "GENERAL", label: "General" },
                  { value: "DELIVERY", label: "Delivery" },
                  { value: "SERVICE", label: "Service" },
                  { value: "TRACKING", label: "Tracking" },
                  { value: "BILLING", label: "Billing" },
                  { value: "OTHER", label: "Other" },
                ]}
              />

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Comment"
                  name="comment"
                  value={createForm.comment}
                  onChange={handleCreateChange}
                  required
                />
              </div>
            </div>

            <ModalButtons
              loading={creating}
              onCancel={() => setCreateOpen(false)}
              submitText="Submit Feedback"
            />
          </form>
        </Modal>
      )}

      {updateOpen && selectedFeedback && (
        <Modal
          title="Update Feedback"
          subtitle={`Feedback: ${selectedFeedback.feedbackNo}`}
          onClose={() => !updating && setUpdateOpen(false)}
        >
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Status"
                name="status"
                value={updateForm.status}
                onChange={handleUpdateChange}
                options={[
                  { value: "NEW", label: "New" },
                  { value: "REVIEWED", label: "Reviewed" },
                  { value: "FOLLOW_UP", label: "Follow Up" },
                  { value: "CLOSED", label: "Closed" },
                ]}
              />

              <SelectField
                label="Rating"
                name="rating"
                value={updateForm.rating}
                onChange={handleUpdateChange}
                options={[
                  { value: 5, label: "5 stars" },
                  { value: 4, label: "4 stars" },
                  { value: 3, label: "3 stars" },
                  { value: 2, label: "2 stars" },
                  { value: 1, label: "1 star" },
                ]}
              />

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Comment"
                  name="comment"
                  value={updateForm.comment}
                  onChange={handleUpdateChange}
                  required
                />
              </div>
            </div>

            <ModalButtons
              loading={updating}
              onCancel={() => setUpdateOpen(false)}
              submitText="Save Changes"
            />
          </form>
        </Modal>
      )}

      {viewOpen && selectedFeedback && (
        <Modal
          title="Feedback Details"
          subtitle={`Feedback: ${selectedFeedback.feedbackNo}`}
          onClose={() => {
            setViewOpen(false);
            setSelectedFeedback(null);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Customer"
              value={selectedFeedback.name}
            />

            <Detail
              label="Email"
              value={selectedFeedback.email}
            />

            <Detail
              label="Contact Number"
              value={selectedFeedback.contactNo}
            />

            <Detail
              label="Rating"
              value={`${selectedFeedback.rating} / 5`}
            />

            <Detail
              label="Category"
              value={formatEnum(selectedFeedback.category)}
            />

            <Detail
              label="Status"
              value={formatEnum(selectedFeedback.status)}
            />

            <Detail
              label="Submitted"
              value={formatDate(selectedFeedback.createdAt)}
            />

            <Detail
              label="Sentiment"
              value={getSentiment(selectedFeedback.rating)}
            />

            <Detail
              label="Comment"
              value={selectedFeedback.comment}
              full
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${
            star <= rating ? "text-amber-500" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-bold text-slate-900">
        {value}
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
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows="5"
        className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
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
