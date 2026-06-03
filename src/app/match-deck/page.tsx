"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Upload, FileText, Sparkles, ExternalLink, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeckProfile {
  companyName: string | null;
  stage: string;
  sectors: string[];
  businessModel: string;
  marketSize: string;
  tractionSummary: string;
  teamStrength: number;
  deckQuality: number;
  strengths: string[];
  gaps: string[];
}

interface ProgrammeResult {
  id: string;
  slug: string;
  name: string;
  type: string;
  country: string;
  location: string;
  investmentMin: number | null;
  investmentMax: number | null;
  equityTaken: number | null;
  currency: string;
  description: string;
  fitScore: number;
  fitReasons: string[];
}

const STAGE_LABELS: Record<string, string> = {
  PRE_IDEA: "Pre-idea",
  PRE_SEED: "Pre-seed",
  SEED: "Seed",
  SERIES_A: "Series A",
};

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
      score >= 70 ? "bg-green-500/20 text-green-400" :
      score >= 50 ? "bg-amber-500/20 text-amber-400" :
      "bg-zinc-700 text-zinc-400"
    )}>
      {score}% fit
    </div>
  );
}

function formatInv(min: number | null, max: number | null, currency = "GBP") {
  if (!min && !max) return null;
  const sym = currency === "EUR" ? "€" : "£";
  const fmt = (n: number) => n >= 1000000 ? `${sym}${(n / 1000000).toFixed(1)}m` : `${sym}${(n / 1000).toFixed(0)}k`;
  if (min && max && min === max) return fmt(min);
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export default function MatchDeckPage() {
  const [stage, setStage] = useState<"capture" | "upload" | "loading" | "results">("capture");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"pdf" | "text">("pdf");
  const [profile, setProfile] = useState<DeckProfile | null>(null);
  const [results, setResults] = useState<ProgrammeResult[]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStage("upload");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStage("loading");

    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      if (inputMode === "pdf" && file) {
        form.append("deck", file);
      } else {
        form.append("text", text);
      }

      const res = await fetch("/api/match-deck", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStage("upload");
        return;
      }

      setProfile(data.profile);
      setResults(data.results ?? []);
      setStage("results");
    } catch {
      setError("Network error. Please try again.");
      setStage("upload");
    }
  }

  function reset() {
    setStage("capture");
    setProfile(null);
    setResults([]);
    setFile(null);
    setText("");
    setError("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered deck matching
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Match your deck to programmes</h1>
        <p className="mt-3 max-w-xl mx-auto text-zinc-400">
          Upload your pitch deck and we&apos;ll analyse it against every accelerator and venture studio in our directory — giving you a fit score for each.
        </p>
      </div>

      {/* Step 1: Lead capture */}
      {stage === "capture" && (
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-6 text-lg font-semibold text-white">Tell us about yourself</h2>
            <form onSubmit={handleCapture} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Your name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Company email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@yourcompany.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Upload */}
      {stage === "upload" && (
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-2 text-lg font-semibold text-white">Upload your deck</h2>
            <p className="mb-6 text-sm text-zinc-400">Hi {name} — choose how to share your deck below.</p>

            {/* Mode toggle */}
            <div className="mb-6 flex rounded-lg border border-zinc-700 p-0.5">
              {(["pdf", "text"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setInputMode(m)}
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                    inputMode === m ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {m === "pdf" ? "Upload PDF" : "Paste description"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {inputMode === "pdf" ? (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
                      file ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-700 hover:border-zinc-500"
                    )}
                  >
                    {file ? (
                      <>
                        <FileText className="h-8 w-8 text-indigo-400" />
                        <span className="text-sm font-medium text-white">{file.name}</span>
                        <span className="text-xs text-zinc-500">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-zinc-500" />
                        <span className="text-sm text-zinc-400">Click to select your pitch deck PDF</span>
                        <span className="text-xs text-zinc-600">Max 10 MB</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your startup: what you do, your target market, current stage, traction so far, and what you're looking for from an accelerator..."
                  rows={8}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
                />
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={(inputMode === "pdf" && !file) || (inputMode === "text" && !text.trim())}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Match my deck
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {stage === "loading" && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
          <p className="text-zinc-400">Analysing your deck against {">"}100 programmes…</p>
          <p className="text-xs text-zinc-600">This takes about 10–15 seconds</p>
        </div>
      )}

      {/* Results */}
      {stage === "results" && profile && (
        <div>
          {/* Deck summary card */}
          <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {profile.companyName ?? "Your startup"} — {STAGE_LABELS[profile.stage] ?? profile.stage}
                </h2>
                {profile.sectors.length > 0 && (
                  <p className="mt-1 text-sm text-zinc-400">{profile.sectors.join(" · ")}</p>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full border border-zinc-700 px-2 py-1 text-zinc-400">
                  Deck quality: {profile.deckQuality}/5
                </span>
                <span className="rounded-full border border-zinc-700 px-2 py-1 text-zinc-400">
                  Team: {profile.teamStrength}/5
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.strengths.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-500">Strengths</p>
                  <ul className="flex flex-col gap-1">
                    {profile.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-zinc-300">
                        <span className="mt-0.5 text-green-500">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.gaps.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500">Areas to strengthen</p>
                  <ul className="flex flex-col gap-1">
                    {profile.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-zinc-300">
                        <span className="mt-0.5 text-amber-500">→</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Programme results */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {results.length} best-fit programmes
            </h3>
            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {results.map((p) => (
              <div key={p.id} className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="rounded-md border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400">
                        {p.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-zinc-500">{p.location}, {p.country}</span>
                    </div>
                    <p className="mb-3 text-xs text-zinc-500 line-clamp-2">{p.description}</p>
                    {p.fitReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.fitReasons.map((r, i) => (
                          <span key={i} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    {formatInv(p.investmentMin, p.investmentMax, p.currency) && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Investment: {formatInv(p.investmentMin, p.investmentMax, p.currency)}
                        {p.equityTaken ? ` · ${p.equityTaken}% equity` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <ScoreBadge score={p.fitScore} />
                    <Link
                      href={`/programme/${p.slug}`}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-zinc-400">No strong matches found. Try expanding your sectors or stage.</p>
              <button onClick={reset} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300">
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
