"use client";

import { useState } from "react";
import { Bell, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SECTORS, UK_LOCATIONS, STAGE_LABELS, TYPE_LABELS } from "@/lib/constants";

export default function AlertsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    sectors: [] as string[],
    stages: [] as string[],
    types: [] as string[],
    location: "",
    seisOnly: false,
  });

  function toggle<K extends "sectors" | "stages" | "types">(field: K, val: string) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter((x) => x !== val)
        : [...prev[field], val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">You&apos;re all set!</h1>
        <p className="mb-6 text-zinc-400">
          We&apos;ll email you when new programmes matching your preferences open applications.
        </p>
        <Button href="/directory">
          Browse directory <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20">
          <Bell className="h-6 w-6 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Application deadline alerts</h1>
        <p className="mt-2 text-zinc-400">
          Tell us what you&apos;re looking for. We&apos;ll notify you when matching programmes open applications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Email */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <label className="mb-2 block text-sm font-medium text-zinc-300">Email address *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@startup.com"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Programme type */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-medium text-zinc-300">Programme types (leave blank for all)</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => toggle("types", val)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.types.includes(val)
                    ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                    : "border-zinc-800 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-medium text-zinc-300">Your startup stage</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STAGE_LABELS).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => toggle("stages", val)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.stages.includes(val)
                    ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                    : "border-zinc-800 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-medium text-zinc-300">Sectors you&apos;re in</p>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {SECTORS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggle("sectors", s)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.sectors.includes(s)
                    ? "border-indigo-500 bg-indigo-600/20 text-indigo-400"
                    : "border-zinc-800 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Location + SEIS */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-medium text-zinc-300">Preferences</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Location preference</label>
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Any UK location</option>
                {UK_LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <div
                onClick={() => setForm({ ...form, seisOnly: !form.seisOnly })}
                className={`relative h-5 w-9 rounded-full transition-colors ${form.seisOnly ? "bg-indigo-600" : "bg-zinc-700"}`}
              >
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.seisOnly ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-zinc-400">SEIS-eligible programmes only</span>
            </label>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={loading || !form.email}>
          {loading ? "Setting up alerts..." : "Set up my alerts"}
        </Button>
        <p className="text-center text-xs text-zinc-600">
          No spam. Unsubscribe at any time. We only email when matching programmes open.
        </p>
      </form>
    </div>
  );
}
