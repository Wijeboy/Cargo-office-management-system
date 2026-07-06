import { useMemo, useState } from "react";

const PAGE_SIZE = 4;

const feedbackData = [
  {
    id: 1,
    customer: "Amelia Silva",
    email: "amelia.silva@example.com",
    initials: "AS",
    rating: 5,
    comment:
      "The shipment arrived earlier than expected and the tracking updates were very clear. Excellent service.",
    shipment: "SHP-89472A",
    submitted: "26 Jun 2026",
    channel: "Email Survey",
    sentiment: "Positive",
    reviewStatus: "Reviewed",
    secondaryAction: "Reply",
  },
  {
    id: 2,
    customer: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    initials: "RK",
    rating: 2,
    comment:
      "The delivery was delayed and I did not receive an update until I contacted support.",
    shipment: "SHP-89480B",
    submitted: "25 Jun 2026",
    channel: "Web Form",
    sentiment: "Negative",
    reviewStatus: "Needs Follow-up",
    secondaryAction: "Create Inquiry",
  },
  {
    id: 3,
    customer: "Maya Fernando",
    email: "maya.fernando@example.com",
    initials: "MF",
    rating: 4,
    comment:
      "Customer service answered quickly and helped me update the delivery contact without any issue.",
    shipment: "SHP-89495C",
    submitted: "24 Jun 2026",
    channel: "SMS Survey",
    sentiment: "Positive",
    reviewStatus: "Reviewed",
    secondaryAction: "Reply",
  },
  {
    id: 4,
    customer: "Dilan Perera",
    email: "dilan.perera@example.com",
    initials: "DP",
    rating: 3,
    comment:
      "The cargo arrived safely, but the online tracking page could provide more detailed location updates.",
    shipment: "SHP-89503D",
    submitted: "23 Jun 2026",
    channel: "In-system",
    sentiment: "Neutral",
    reviewStatus: "Reviewed",
    secondaryAction: "Add Note",
  },
];

function avatarClasses(index) {
  const styles = [
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-orange-100 text-orange-700",
    "bg-emerald-100 text-emerald-700",
  ];

  return styles[index % styles.length];
}

function sentimentClasses(sentiment) {
  switch (sentiment) {
    case "Positive":
      return "bg-emerald-100 text-emerald-700";
    case "Negative":
      return "bg-rose-100 text-rose-700";
    case "Neutral":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function reviewStatusClasses(status) {
  return status === "Needs Follow-up"
    ? "bg-amber-100 text-amber-700"
    : "bg-sky-100 text-sky-700";
}

export default function FeedbackManagement() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFeedback = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return feedbackData.filter((feedback) => {
      const matchesSearch =
        !searchValue ||
        feedback.customer.toLowerCase().includes(searchValue) ||
        feedback.shipment.toLowerCase().includes(searchValue) ||
        feedback.comment.toLowerCase().includes(searchValue);

      const matchesRating =
        ratingFilter === "All" ||
        feedback.rating === Number(ratingFilter);

      const matchesSentiment =
        sentimentFilter === "All" ||
        feedback.sentiment === sentimentFilter;

      return matchesSearch && matchesRating && matchesSentiment;
    });
  }, [search, ratingFilter, sentimentFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeedback.length / PAGE_SIZE)
  );

  const visibleFeedback = filteredFeedback.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const exportCSV = () => {
    const headings = [
      "Customer",
      "Email",
      "Rating",
      "Comment",
      "Shipment",
      "Submitted",
      "Channel",
      "Sentiment",
      "Review Status",
    ];

    const rows = filteredFeedback.map((feedback) => [
      feedback.customer,
      feedback.email,
      feedback.rating,
      feedback.comment,
      feedback.shipment,
      feedback.submitted,
      feedback.channel,
      feedback.sentiment,
      feedback.reviewStatus,
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
    link.download = "feedback.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span className="text-xl leading-none">+</span>
          Request Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="star"
          label="Average Rating"
          value="4.6 / 5"
          trend="+0.3"
          iconClasses="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon="check"
          label="Positive Feedback"
          value="82%"
          trend="+9.8%"
          iconClasses="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          icon="priority_high"
          label="Negative Feedback"
          value="7%"
          trend="-2.4%"
          negative
          iconClasses="bg-rose-100 text-rose-700"
        />

        <StatCard
          icon="schedule"
          label="Feedback This Month"
          value="146"
          trend="+11.2%"
          iconClasses="bg-amber-100 text-amber-700"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_140px_170px_120px]">
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
              placeholder="Search by customer, shipment, or comment..."
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
            <option value="All">All ratings</option>
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
            <option value="All">All sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {visibleFeedback.map((feedback, index) => (
            <article
              key={feedback.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClasses(
                      index
                    )}`}
                  >
                    {feedback.initials}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {feedback.customer}
                    </p>

                    <p className="text-xs text-slate-500">
                      {feedback.email}
                    </p>
                  </div>
                </div>

                <StarRating rating={feedback.rating} />
              </div>

              <p className="mt-5 min-h-[54px] text-sm leading-6 text-slate-600">
                “{feedback.comment}”
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoBox
                  label="Shipment"
                  value={`#${feedback.shipment}`}
                />

                <InfoBox
                  label="Submitted"
                  value={feedback.submitted}
                />

                <InfoBox
                  label="Channel"
                  value={feedback.channel}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${sentimentClasses(
                    feedback.sentiment
                  )}`}
                >
                  {feedback.sentiment}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${reviewStatusClasses(
                    feedback.reviewStatus
                  )}`}
                >
                  {feedback.reviewStatus}
                </span>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Details
                </button>

                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {feedback.secondaryAction}
                </button>
              </div>
            </article>
          ))}

          {visibleFeedback.length === 0 && (
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
              filteredFeedback.length
            )}{" "}
            of {filteredFeedback.length} feedback records
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

      <p className="mt-1 text-xs font-bold text-slate-900">
        {value}
      </p>
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