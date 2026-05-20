import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { AdSlot } from "@/components/ui/AdSlot";
import { ReviewForm } from "@/components/programme/ReviewForm";
import { TYPE_LABELS, STAGE_LABELS } from "@/lib/constants";
import { formatInvestment, formatDeadline, formatEquity, avgRating } from "@/lib/utils";
import {
  MapPin, Globe, ExternalLink, Clock, Users, TrendingUp,
  Calendar, ArrowLeft, CheckCircle, Mail
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProgramme(slug: string) {
  return prisma.programme.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgramme(slug);
  if (!p) return { title: "Not Found" };
  return {
    title: p.name,
    description: p.description,
  };
}

function buildJsonLd(p: NonNullable<Awaited<ReturnType<typeof getProgramme>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: p.name,
    description: p.description,
    url: p.websiteUrl,
    ...(p.logoUrl ? { logo: p.logoUrl } : {}),
    address: {
      "@type": "PostalAddress",
      addressCountry: "GB",
      addressLocality: p.location ?? "United Kingdom",
    },
  };
}

export default async function ProgrammePage({ params }: PageProps) {
  const { slug } = await params;
  const p = await getProgramme(slug);
  if (!p) notFound();

  const deadline = formatDeadline(p.applicationDeadline);
  const reviews = p.reviews;
  const avg = avgRating(reviews.map((r) => r.overallRating));

  const jsonLd = buildJsonLd(p);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/directory"
        className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold text-zinc-300">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.name} className="h-full w-full rounded-xl object-contain p-2" />
              ) : (
                p.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{p.name}</h1>
                {p.isFeatured && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={`border px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border-indigo-500/20`}>
                  {TYPE_LABELS[p.type]}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" />{p.location}
                  {p.isRemote && " · Remote available"}
                </span>
              </div>
              {avg != null && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={avg} size="md" />
                  <span className="text-sm font-medium text-zinc-300">{avg}</span>
                  <span className="text-sm text-zinc-600">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {p.applyUrl && (
              <Button href={p.applyUrl} external size="lg">
                Apply now <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button href={p.websiteUrl} variant="secondary" external size="lg">
              <Globe className="h-4 w-4" />
              Website
            </Button>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-zinc-400">{p.description}</p>

        {/* Key stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Investment", value: formatInvestment(p.investmentMin, p.investmentMax), icon: TrendingUp },
            { label: "Equity", value: formatEquity(p.equityTaken), icon: null },
            { label: "Cohort size", value: p.cohortSize ? `${p.cohortSize} companies` : "—", icon: Users },
            { label: "Duration", value: p.durationWeeks ? `${p.durationWeeks} weeks` : "—", icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-1 font-semibold text-zinc-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Deadline / cohort */}
        <div className="mt-4 flex flex-wrap gap-3">
          {deadline.label !== "Rolling" && (
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${deadline.urgent ? "border-amber-500/30 bg-amber-500/10" : "border-zinc-800 bg-zinc-800/50"}`}>
              <Calendar className={`h-4 w-4 ${deadline.urgent ? "text-amber-400" : "text-zinc-500"}`} />
              <div>
                <p className="text-xs text-zinc-500">Application deadline</p>
                <p className={`font-semibold ${deadline.urgent ? "text-amber-400" : "text-zinc-200"}`}>
                  {p.applicationDeadline
                    ? p.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : deadline.label}
                  {deadline.urgent && ` (${deadline.label})`}
                </p>
              </div>
            </div>
          )}
          {p.nextCohortDate && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-3">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Next cohort</p>
                <p className="font-semibold text-zinc-200">
                  {p.nextCohortDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sectors / stages / tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {p.seisEligible && <Badge variant="green">SEIS eligible</Badge>}
          {p.eisEligible && <Badge variant="green">EIS eligible</Badge>}
          {p.stages.map((s) => (
            <Badge key={s} variant="accent">{STAGE_LABELS[s] ?? s}</Badge>
          ))}
          {p.sectors.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>

      {/* Ad slot */}
      <AdSlot slot="programme-detail" format="rectangle" className="mt-6" />

      {/* Sponsored CTA */}
      {!p.isSponsored && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
          <p className="text-sm text-zinc-500">
            Are you affiliated with {p.name}?{" "}
            <a
              href="mailto:hello@accelerate.fyi"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
            >
              <Mail className="h-3.5 w-3.5" />
              Get featured on Accelerate.fyi
            </a>
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="mb-5 text-xl font-bold text-white">Founder reviews</h2>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
            <p className="text-zinc-500">No reviews yet. Be the first to review this programme.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-200">{r.authorName}</span>
                      {r.isVerified && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                      )}
                      {r.cohortYear && (
                        <span className="text-xs text-zinc-600">Cohort {r.cohortYear}</span>
                      )}
                    </div>
                    <StarRating rating={r.overallRating} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{r.body}</p>
                {(r.equityRating || r.mentorRating || r.networkRating) && (
                  <div className="mt-3 flex flex-wrap gap-4 border-t border-zinc-800 pt-3">
                    {[
                      { label: "Equity fairness", val: r.equityRating },
                      { label: "Mentorship", val: r.mentorRating },
                      { label: "Network", val: r.networkRating },
                    ].filter(({ val }) => val != null).map(({ label, val }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-600">{label}:</span>
                        <StarRating rating={val!} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-white">Leave a review</h3>
          <ReviewForm programmeId={p.id} />
        </div>
      </div>
    </div>
  );
}
