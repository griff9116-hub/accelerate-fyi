"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Plus } from "lucide-react";
import { SECTORS, UK_LOCATIONS, STAGE_LABELS, TYPE_LABELS } from "@/lib/constants";

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", websiteUrl: "", applyUrl: "", description: "",
    type: "", location: "", isRemote: false,
    sectors: [] as string[], stages: [] as string[],
    seisEligible: false, eisEligible: false,
    equityTaken: "", investmentMin: "", investmentMax: "",
    cohortSize: "", durationWeeks: "", submitterEmail: "",
  });

  function toggle<K extends "sectors" | "stages">(field: K, val: string) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter((x) => x !== val) : [...prev[field], val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          equityTaken: form.equityTaken ? parseFloat(form.equityTaken) : null,
          investmentMin: form.investmentMin ? parseInt(form.investmentMin) : null,
          investmentMax: form.investmentMax ? parseInt(form.investmentMax) : null,
          cohortSize: form.cohortSize ? parseInt(form.cohortSize) : null,
          durationWeeks: form.durationWeeks ? parseInt(form.durationWeeks) : null,
        }),
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
        <h1 className="mb-2 text-2xl font-bold text-white">Submission received!</h1>
        <p className="text-zinc-400">We'll review your programme and get it listed within 48 hours. Thanks for contributing to the directory.</p>
      </div>
    );
  }

  const input = "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none";
  const pillBase = "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer";
  const pillOn = "border-indigo-500 bg-indigo-600/20 text-indigo-400";
  const pillOff = "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
          <Plus className="h-3.5 w-3.5" />
          Submit a programme
        </div>
        <h1 className="text-3xl font-bold text-white">List your programme</h1>
        <p className="mt-2 text-zinc-400">Free to list. We'll review and publish within 48 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-300">Basic information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Programme name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Seedcamp" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Type *</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input}>
                <option value="">Select type</option>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">Website URL *</label>
            <input required type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://" className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">Apply URL</label>
            <input type="url" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} placeholder="https://" className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">Description *</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes your programme unique? Who is it for?" className={`${input} resize-none`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Location *</label>
              <select required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={input}>
                <option value="">Select location</option>
                {UK_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <div onClick={() => setForm({ ...form, isRemote: !form.isRemote })} className={`relative h-5 w-9 rounded-full transition-colors ${form.isRemote ? "bg-indigo-600" : "bg-zinc-700"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isRemote ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-zinc-400">Remote / hybrid available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Sectors (select all that apply)</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <button key={s} type="button" onClick={() => toggle("sectors", s)} className={`${pillBase} ${form.sectors.includes(s) ? pillOn : pillOff}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Stages */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Stages you invest at</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STAGE_LABELS).map(([v, l]) => (
              <button key={v} type="button" onClick={() => toggle("stages", v)} className={`${pillBase} ${form.stages.includes(v) ? pillOn : pillOff}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Investment */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-300">Investment details</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Equity taken (%)</label>
              <input type="number" step="0.1" min="0" max="100" value={form.equityTaken} onChange={(e) => setForm({ ...form, equityTaken: e.target.value })} placeholder="e.g. 6" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Investment min (£)</label>
              <input type="number" min="0" value={form.investmentMin} onChange={(e) => setForm({ ...form, investmentMin: e.target.value })} placeholder="e.g. 50000" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Investment max (£)</label>
              <input type="number" min="0" value={form.investmentMax} onChange={(e) => setForm({ ...form, investmentMax: e.target.value })} placeholder="e.g. 150000" className={input} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Cohort size</label>
              <input type="number" min="1" value={form.cohortSize} onChange={(e) => setForm({ ...form, cohortSize: e.target.value })} placeholder="e.g. 12" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Duration (weeks)</label>
              <input type="number" min="0" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} placeholder="e.g. 12" className={input} />
            </div>
          </div>
          <div className="flex gap-6">
            {[{ key: "seisEligible", label: "SEIS eligible" }, { key: "eisEligible", label: "EIS eligible" }].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-3">
                <div onClick={() => setForm({ ...form, [key]: !form[key as keyof typeof form] })} className={`relative h-5 w-9 rounded-full transition-colors ${form[key as keyof typeof form] ? "bg-indigo-600" : "bg-zinc-700"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form[key as keyof typeof form] ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-zinc-400">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-1.5 text-sm font-semibold text-zinc-300">Your email *</h2>
          <p className="mb-3 text-xs text-zinc-600">Not published. We'll contact you if we need more info.</p>
          <input required type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} placeholder="you@programme.com" className={input} />
        </div>

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Submit programme for review"}
        </Button>
        <p className="text-center text-xs text-zinc-600">Free to list. We review all submissions before publishing.</p>
      </form>
    </div>
  );
}
