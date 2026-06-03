"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle, MapPin, ExternalLink, Mail } from "lucide-react";
import { TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAGES = [
  { value: "idea_preseed", label: "Idea / Pre-seed", desc: "Just an idea, no product or traction yet" },
  { value: "seed", label: "Seed", desc: "Early product, some traction or pilot customers" },
  { value: "growth", label: "Growth", desc: "Revenue-generating, scaling operations" },
  { value: "series_a_plus", label: "Series A+", desc: "Established product, significant revenue, scaling rapidly" },
];

const SECTORS = [
  { value: "tech_software", label: "Tech / Software", desc: "SaaS, AI, developer tools, enterprise software" },
  { value: "hardware_iot", label: "Hardware / IoT", desc: "Physical products, connected devices, robotics" },
  { value: "biotech_healthtech", label: "Biotech / Healthtech", desc: "Life sciences, medical tech, digital health" },
  { value: "climate_cleantech", label: "Climate / Cleantech", desc: "Sustainability, clean energy, carbon" },
  { value: "fintech", label: "Fintech", desc: "Financial services, payments, insurtech" },
  { value: "other", label: "Other / Not sure", desc: "Something else, or not sector-specific" },
];

const CHALLENGES = [
  { value: "product_development", label: "Product development", desc: "Building or improving the core product" },
  { value: "customer_acquisition", label: "Customer acquisition", desc: "Getting more users and customers" },
  { value: "funding", label: "Funding / Investment", desc: "Raising capital for growth" },
  { value: "team_building", label: "Team building", desc: "Hiring key roles, expanding the team" },
  { value: "market_validation", label: "Market validation", desc: "Proving the business model works" },
  { value: "scaling", label: "Scaling operations", desc: "Expanding and operating at greater scale" },
];

const SUPPORT_TYPES = [
  { value: "mentorship_networking", label: "Mentorship & networking", desc: "Experienced advisors and peer founder connections" },
  { value: "funding_opps", label: "Funding opportunities", desc: "Direct investment or warm introductions to investors" },
  { value: "industry_resources", label: "Industry-specific resources", desc: "Sector expertise, partnerships, and specialist tools" },
  { value: "biz_dev_sales", label: "Business development & sales", desc: "GTM strategy and enterprise relationships" },
  { value: "technical_expertise", label: "Technical expertise", desc: "Engineering, product, and R&D support" },
];

const OUTCOMES = [
  { value: "fundraising", label: "Secure investment", desc: "Raise a round with support from the programme" },
  { value: "product_tech", label: "Refine product-market fit", desc: "Sharpen your product and tech approach" },
  { value: "sales_gtm", label: "Expand into new markets", desc: "Build sales pipelines and go-to-market strategy" },
  { value: "hiring_people", label: "Build a stronger team", desc: "Hire and develop key people" },
  { value: "pr_comms", label: "Gain credibility and visibility", desc: "PR, partnerships, and brand building" },
];

interface WizardAnswers {
  stage: string;
  sector: string;
  challenge: string;
  supportType: string;
  outcome: string;
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
          <h2 className="mb-2 text-xl font-semibold text-white">What stage is your startup currently in?</h2>
          <div className="mt-6 flex flex-col gap-3">
            {STAGES.map((s) => (
              <OptionCard key={s.value} selected={answers.stage === s.value} onClick={() => next({ stage: s.value })}>
                <p className="font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Sector */}
      {step === 2 && (
        <div>
          <StepHeader step={2} total={totalSteps} />
          <h2 className="mb-2 text-xl font-semibold text-white">What is your primary industry or sector?</h2>
          <div className="mt-6 flex flex-col gap-3">
            {SECTORS.map((s) => (
              <OptionCard key={s.value} selected={answers.sector === s.value} onClick={() => next({ sector: s.value })}>
                <p className="font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.desc}</p>
              </OptionCard>
            ))}
          </div>
          <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      )}

      {/* Step 3: Challenge */}
      {step === 3 && (
        <div>
          <StepHeader step={3} total={totalSteps} />
          <h2 className="mb-2 text-xl font-semibold text-white">What is your biggest current challenge?</h2>
          <div className="mt-6 flex flex-col gap-3">
            {CHALLENGES.map((c) => (
              <OptionCard key={c.value} selected={answers.challenge === c.value} onClick={() => next({ challenge: c.value })}>
                <p className="font-medium">{c.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{c.desc}</p>
              </OptionCard>
            ))}
          </div>
          <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      )}

      {/* Step 4: Support type */}
      {step === 4 && (
        <div>
          <StepHeader step={4} total={totalSteps} />
          <h2 className="mb-2 text-xl font-semibold text-white">What type of support do you need most?</h2>
          <div className="mt-6 flex flex-col gap-3">
            {SUPPORT_TYPES.map((s) => (
              <OptionCard key={s.value} selected={answers.supportType === s.value} onClick={() => next({ supportType: s.value })}>
                <p className="font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{s.desc}</p>
              </OptionCard>
            ))}
          </div>
          <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      )}

      {/* Step 5: Outcome */}
      {step === 5 && (
        <div>
          <StepHeader step={5} total={totalSteps} />
          <h2 className="mb-2 text-xl font-semibold text-white">What is your ideal outcome from joining an accelerator?</h2>
          <div className="mt-6 flex flex-col gap-3">
            {OUTCOMES.map((o) => (
              <OptionCard key={o.value} selected={answers.outcome === o.value} onClick={() => next({ outcome: o.value })}>
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
