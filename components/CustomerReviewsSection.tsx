"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type ReviewRecord = {
  id: string;
  customer_name: string;
  customer_role: string | null;
  rating: number;
  review_text: string;
  created_at: string;
};

type ReviewFormState = {
  name: string;
  role: string;
  rating: number;
  message: string;
  honeypot: string;
};

type FormErrors = Partial<Record<keyof ReviewFormState, string>>;

const initialFormState: ReviewFormState = {
  name: "",
  role: "",
  rating: 5,
  message: "",
  honeypot: "",
};

const COOLDOWN_MS = 15_000;
const NAME_MIN = 2;
const NAME_MAX = 80;
const ROLE_MAX = 100;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently shared";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={`${rating}-${index}`}
      className={index < rating ? "text-amber-400" : "text-slate-300"}
      aria-hidden="true"
    >
      ★
    </span>
  ));
}

export default function CustomerReviewsSection() {
  const [form, setForm] = useState<ReviewFormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);
  const hasMounted = true;

  useEffect(() => {
    let isActive = true;

    const loadReviews = async () => {
      setIsLoadingReviews(true);
      setReviewsError(null);

      const client = createSupabaseBrowserClient();
      if (!client) {
        if (isActive) {
          setReviews([]);
          setReviewsError("Review service is not available right now.");
          setIsLoadingReviews(false);
        }
        return;
      }

      try {
        const { data, error } = await client
          .from("customer_reviews")
          .select("id, customer_name, customer_role, rating, review_text, created_at")
          .order("created_at", { ascending: false });

        if (!isActive) {
          return;
        }

        if (error) {
          console.error("[CustomerReviewsSection] Failed to load reviews", error.message, error.code, error.details);
          setReviews([]);
          setReviewsError("We could not load the latest reviews right now.");
        } else {
          setReviews((data ?? []) as ReviewRecord[]);
        }
      } catch (loadError) {
        console.error("[CustomerReviewsSection] Failed to load reviews", loadError);
        if (isActive) {
          setReviews([]);
          setReviewsError("We could not load the latest reviews right now.");
        }
      } finally {
        if (isActive) {
          setIsLoadingReviews(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isActive = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return {
      average: average.toFixed(1),
      count: reviews.length,
    };
  }, [reviews]);

  function validateForm(nextForm: ReviewFormState) {
    const nextErrors: FormErrors = {};

    const name = nextForm.name.trim();
    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      nextErrors.name = `Please enter your name using ${NAME_MIN}-${NAME_MAX} characters.`;
    }

    const role = nextForm.role.trim();
    if (role && role.length > ROLE_MAX) {
      nextErrors.role = `Identity should stay within ${ROLE_MAX} characters.`;
    }

    if (nextForm.rating < 1 || nextForm.rating > 5) {
      nextErrors.rating = "Please choose a rating from 1 to 5 stars.";
    }

    const message = nextForm.message.trim();
    if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
      nextErrors.message = `Please write ${MESSAGE_MIN}-${MESSAGE_MAX} characters of feedback.`;
    }

    return nextErrors;
  }

  function updateField(field: keyof ReviewFormState, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status) {
      setStatus("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("");
      return;
    }

    if (form.honeypot) {
      setStatus("");
      return;
    }

    const now = Date.now();
    if (lastSubmittedAt && now - lastSubmittedAt < COOLDOWN_MS) {
      setStatus("Please wait a moment before submitting another review.");
      return;
    }

    const client = createSupabaseBrowserClient();
    if (!client) {
      setStatus("Review submission is unavailable right now.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const { error } = await client.from("customer_reviews").insert({
        customer_name: form.name.trim(),
        customer_role: form.role.trim() || null,
        rating: form.rating,
        review_text: form.message.trim(),
      });

      if (error) {
        setStatus("We could not submit your review. Please try again in a moment.");
        return;
      }

      setStatus("Thank you! Your review has been submitted and will appear after approval.");
      setForm(initialFormState);
      setErrors({});
      setLastSubmittedAt(now);
    } catch {
      setStatus("We could not submit your review. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20" id="reviews">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Customer Reviews</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Rate Your Experience</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Used a Shivanandu Digital Center service? Share your experience with us.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xl shadow-slate-200/70 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Share your feedback</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Your review will be checked before publication.
                </p>
              </div>
              <div className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700">
                {hasMounted ? "Public review form" : "Preparing form"}
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="review-rating">Your rating</label>
                <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Rate your experience">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        className="text-3xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        aria-pressed={form.rating >= value}
                        onClick={() => updateField("rating", value)}
                      >
                        <span className={value <= form.rating ? "text-amber-400" : "text-slate-300"}>★</span>
                      </button>
                    );
                  })}
                </div>
                {errors.rating ? <p className="mt-2 text-sm text-red-600">{errors.rating}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="review-name">Customer name</label>
                <input
                  id="review-name"
                  name="name"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  maxLength={NAME_MAX}
                  required
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{errors.name ? <span className="text-red-600">{errors.name}</span> : "Please use your real name or a clear display name."}</span>
                  <span>{form.name.trim().length}/{NAME_MAX}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="review-role">Identity / Profession</label>
                <input
                  id="review-role"
                  name="role"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={form.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  maxLength={ROLE_MAX}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{errors.role ? <span className="text-red-600">{errors.role}</span> : "Optional. Add your role, profession, or business name."}</span>
                  <span>{form.role.trim().length}/{ROLE_MAX}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="review-message">Review message</label>
                <textarea
                  id="review-message"
                  name="message"
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  maxLength={MESSAGE_MAX}
                  required
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{errors.message ? <span className="text-red-600">{errors.message}</span> : "Share a short, honest review about your experience."}</span>
                  <span>{form.message.trim().length}/{MESSAGE_MAX}</span>
                </div>
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="review-honeypot">Leave this blank</label>
                <input id="review-honeypot" name="honeypot" value={form.honeypot} onChange={(event) => updateField("honeypot", event.target.value)} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSubmitting ? "Submitting…" : "Submit Review"}
              </button>

              {status ? <p className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{status}</p> : null}
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Community feedback</h3>
                <p className="mt-2 text-sm text-slate-600">Approved reviews from recent customers.</p>
              </div>
              {summary ? (
                <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                  ★ {summary.average} · {summary.count} review{summary.count === 1 ? "" : "s"}
                </div>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              {isLoadingReviews ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Loading recent reviews…</div>
              ) : reviewsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{reviewsError}</div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  Be the first to share your experience.
                </div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{review.customer_name}</h4>
                          {review.customer_role ? <span className="text-sm text-slate-500">• {review.customer_role}</span> : null}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-lg" aria-label={`${review.rating} out of 5 stars`}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">{formatDate(review.created_at)}</p>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-700">“{review.review_text}”</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
