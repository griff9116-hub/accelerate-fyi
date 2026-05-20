"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle, MapPin, ExternalLink, Mail } from "lucide-react";
import { SECTORS, TYPE_LABELS, EUROPEAN_COUNTRIES, CITIES_BY_COUNTRY } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAGES = [
  { value: "PRE_IDEA", label: "Pre-idea", desc: "Haven't started yet / looking for a co-founder" },
  { value: "PRE_SEED", label: "Pre-seed", desc: "Have an idea or early prototype, no revenue" },
  { value: "SEED", label: "Seed", desc: "Early revenue or strong traction, raising first round" },
  { value: "SERIES_A", label: "Series A", desc: "Scaling, looking for growth capital" },
];

const PRIORITIES = [
  { value: "funding", label: "Funding amount", desc: "The size of the investment matters most" },
  { value: "mentorship", label: "Mentorship quality", desc: "Access to experienced operators and advisors" },
  { value: "network", label: "Investor network", desc: "Introductions to VCs and angels" },
  { value: "equity_free", label: "Equity-free", desc: "I don't want to give up any equity" },
];

const SEIS_OPTIONS = [
  { value: "yes", label: "Yes", desc: "SEIS eligibility is important for my fundraise" },
  { value: "no", label: "No", desc: "I don't need SEIS" },
  { value: "doesnt_matter", label: "Doesn't matter", desc: "No preference" },
];

interface WizardAnswers {
  stage: string;
  sectors: string[];
  priority: string;
  country: string;
  city: string;
  seisNeeded: string;
}

interface MatchResult {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  location: string;
  country: string;
  currency: string;
  investmentMin: number | null;
  investmentMax: number | null;
  matchScore: number;
  matchReasons: string[];
  isFeatured: boolean;
  isSponsored: boolean;
}

function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < step ? "bg-indigo-500" : "bg-zinc-800"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-500">Step {step} of {total}</p>
    </div>
  );
}

function OptionCard({
  selected, onClick, children,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left transition-all",
        selected
          ? "border-indigo-500 bg-indigo-500/10 text-white"
          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function formatInv(min: number | null, max: number | null, currency = "GBP"): string {
  if (!min && !max) return "Undisclosed";
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
  const fmt = (n: number) => n >= 1000000 ? `${sym}${(n / 1000000).toFixed(1)}m` : `${sym}${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export default function FindPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const totalSteps = 5;

  async function submit(finalAnswers: WizardAnswers) {
    setLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      setStep(6);
    } catch {
      setStep(6);
    } finally {
      setLoading(false);
    }
  }

  async function saveResponse(email: string) {
    if (!answers.stage) return;
    await fetch("/api/wizard-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...answers, email: email || undefined }),
    }).catch(() => {});
    setEmailSent(true);
  }

  function next(update: Partial<WizardAnswers>) {
    const merged = { ...answers, ...update };
    setAnswers(merged);
    if (step === totalSteps) {
      submit(merged as WizardAnswers);
    } else {
      setStep(step + 1);
    }
  }

  const selectedCountry = answers.country ?? "UK";
  const cities = CITIES_BY_COUNTRY[selectedCountry] ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Smart matching
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Find your perfect match</h1>
        <p className="mt-3 text-zinc-400">
          Answer 5 quick questions and we&apos;ll rank the best-fit programmes across Europe for you.
        </p>
      </div>

      {/* Step 1: Stage */}
      {step === 1 && (
        <div>
          <StepHeader step={1} total={totalSteps} />
          <h2 className="mb-6 text-xl font-semibold text-white">What stage are you at?</h2>
          <div className="flex flex-col gap-3">
            {STAGES.map((s) => (
              <OptionCard key={s.value} selected={answers.stage === s.value} onClick={() => next({ stage: s.value })}>
                <p className="font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Sectors */}
      {step === 2 && (
        <div>
          <StepHeader step={2} total={totalSteps} />
          <h2 className="mb-2 text-xl font-semibold text-white">What sector are you in?</h2>
          <p className="mb-6 text-sm text-zinc-500">Select up to 3. Skip if sector-agnostic.</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {SECTORS.map((s) => {
              const sel = (answers.sectors ?? []).includes(s);
              return (
                <button
                  key={s}
                  onClick={() => {
                    const cur = answers.sectors ?? [];
                    const next = sel ? cur.filter((x) => x !== s) : cur.length < 3 ? [...cur, s] : cur;
                    setAnswers({ ...answers, sectors: next });
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-all",
                    sel ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button onClick={() => next({ sectors: answers.sectors ?? [] })} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Priority */}
      {step === 3 && (
        <div>
          <StepHeader step={3} total={totalSteps} />
          <h2 className="mb-6 text-xl font-semibold text-white">What matters most to you?</h2>
          <div className="flex flex-col gap-3">
            {PRIORITIES.map((p) => (
              <OptionCard key={p.value} selected={answers.priority === p.value} onClick={() => next({ priority: p.value })}>
                <p className="font-medium">{p.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{p.desc}</p>
              </OptionCard>
            ))}
          </div>
          <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      )}

      {/* Step 4: Location — country first, then city */}
      {step === 4 && (
        <div>
          <StepHeader step={4} total={totalSteps} />
          <h2 className="mb-6 text-xl font-semibold text-white">Where are you based?</h2>

          {/* Country */}
          <p className="mb-2 text-sm text-zinc-400">Country</p>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(EUROPEAN_COUNTRIES as unknown as string[]).map((c) => (
              <button
                key={c}
                onClick={() => setAnswers({ ...answers, country: c, city: "" })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-all text-left",
                  answers.country === c
                    ? "border-indigo-500 bg-indigo-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* City (if country selected and has cities) */}
          {selectedCountry && cities.length > 0 && (
            <>
              <p className="mb-2 text-sm text-zinc-400">City (optional)</p>
              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAnswers({ ...answers, city: answers.city === c ? "" : c })}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition-all text-left",
                      answers.city === c
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => next({ country: answers.country ?? "UK", city: answers.city ?? "" })}
              disabled={!answers.country}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: SEIS */}
      {step === 5 && (
        <div>
          <StepHeader step={5} total={totalSteps} />
          <h2 className="mb-2 text-xl font-semibold text-white">Do you need SEIS/EIS eligibility?</h2>
          <p className="mb-6 text-sm text-zinc-500">UK-specific tax relief giving investors up to 50% back — makes fundraising significantly easier for UK companies.</p>
          <div className="flex flex-col gap-3">
            {SEIS_OPTIONS.map((o) => (
              <OptionCard key={o.value} selected={answers.seisNeeded === o.value} onClick={() => next({ seisNeeded: o.value })}>
                <p className="font-medium">{o.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{o.desc}</p>
              </OptionCard>
            ))}
          </div>
          <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      )}

      {/* Loading */}
      {step === 6 && loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
          <p className="text-zinc-400">Finding your best matches…</p>
        </div>
      )}

      {/* Results */}
      {step === 6 && !loading && (
        <div>
          <div className="mb-8 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Your top matches</h2>
            <p className="mt-2 text-sm text-zinc-400">Ranked by fit. Click any to view full details.</p>
          </div>

          {/* Email capture */}
          {!emailSent && (
            <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="mb-3 text-sm font-medium text-zinc-300">
                <Mail className="mr-1.5 inline h-4 w-4 text-indigo-400" />
                Get these results + new matches emailed to you
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => saveResponse(captureEmail)}
                  disabled={!captureEmail.includes("@")}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          )}
          {emailSent && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400">
              <CheckCircle className="mr-1.5 inline h-4 w-4" /> Saved — we&apos;ll email you new matches.
            </div>
          )}

          {results.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400">No matches found. Try the full directory.</p>
              <Link href="/directory" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
                Browse all programmes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/programme/${r.slug}`}
                  className="group block rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-zinc-600 hover:bg-zinc-800/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2 flex-wrap">
                        {i === 0 && (
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-400">Best match</span>
                        )}
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          {TYPE_LABELS[r.type] ?? r.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{r.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3" />
                        {r.location}{r.country && r.country !== "UK" && `, ${r.country}`}
                      </p>
                      <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{r.description}</p>
                      {r.matchReasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {r.matchReasons.map((reason) => (
                            <span key={reason} className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-sm font-bold text-indigo-400">
                        {r.matchScore}
                      </div>
                      <p className="text-xs text-zinc-600">score</p>
                    </div>
                  </div>
                  {(r.investmentMin !== null || r.investmentMax !== null) && (
                    <p className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                      Investment: <span className="text-zinc-300">{formatInv(r.investmentMin, r.investmentMax, r.currency)}</span>
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => { setStep(1); setAnswers({}); setResults([]); setEmailSent(false); setCaptureEmail(""); }}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Start over
            </button>
            <Link href="/directory" className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
              Browse full directory <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
