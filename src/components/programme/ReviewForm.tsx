"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

interface ReviewFormProps {
  programmeId: string;
}

export function ReviewForm({ programmeId }: ReviewFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    authorName: "",
    cohortYear: "",
    body: "",
    overallRating: 0,
    equityRating: 0,
    mentorRating: 0,
    networkRating: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.overallRating || !form.body.trim() || !form.authorName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, programmeId }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-5">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <div>
          <p className="font-medium text-green-300">Review submitted</p>
          <p className="text-sm text-green-500">Your review will appear after moderation. Thank you!</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Your name *</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              placeholder="Founder name"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Cohort year</label>
            <input
              type="number"
              value={form.cohortYear}
              onChange={(e) => setForm({ ...form, cohortYear: e.target.value })}
              placeholder="e.g. 2023"
              min={2000}
              max={2030}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">Overall rating *</label>
          <StarRating
            rating={form.overallRating}
            size="md"
            interactive
            onChange={(v) => setForm({ ...form, overallRating: v })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "equityRating", label: "Equity fairness" },
            { key: "mentorRating", label: "Mentorship quality" },
            { key: "networkRating", label: "Network value" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs text-zinc-500">{label}</label>
              <StarRating
                rating={form[key as keyof typeof form] as number}
                interactive
                onChange={(v) => setForm({ ...form, [key]: v })}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Your review *</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="What was your experience? Was the equity ask fair? How valuable was the mentorship?"
            rows={4}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
            required
          />
        </div>

        <Button type="submit" disabled={loading || !form.overallRating || !form.body.trim()}>
          {loading ? "Submitting..." : "Submit review"}
        </Button>
        <p className="text-xs text-zinc-600">Reviews are moderated before appearing publicly.</p>
      </div>
    </form>
  );
}
