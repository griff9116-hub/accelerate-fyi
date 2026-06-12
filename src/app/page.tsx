import Link from "next/link";
import { ArrowRight, Zap, Search, Bell, Bookmark, Star, TrendingUp, Users, Clock, Building2, Rocket, Lightbulb, Award, Network } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { ProgrammeCard } from "@/components/programme/ProgrammeCard";
import { TYPE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getStats() {
  const [total, types] = await Promise.all([
    prisma.programme.count({ where: { isActive: true, NOT: { type: "VC" } } }),
    prisma.programme.groupBy({ by: ["type"], where: { isActive: true, NOT: { type: "VC" } }, _count: { _all: true } }),
  ]);
  return {
    total,
    byType: Object.fromEntries(
      types.map((t: { type: string; _count: { _all: number } }) => [t.type, t._count._all])
    ),
  };
}

async function getFeatured() {
  const rows = await prisma.programme.findMany({
    where: { isActive: true, isFeatured: true, NOT: { type: "VC" } },
    take: 6,
    orderBy: { isSponsored: "desc" },
  });
  return rows.map((p) => ({
    ...p,
    applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
    nextCohortDate: p.nextCohortDate?.toISOString() ?? null,
    avgRating: null,
    reviewCount: 0,
  }));
}

async function getUpcoming() {
  return prisma.programme.findMany({
    where: {
      isActive: true,
      NOT: { type: "VC" },
      applicationDeadline: { gte: new Date() },
    },
    orderBy: { applicationDeadline: "asc" },
    take: 4,
  });
}

// Same deterministic colour as ProgrammeCard
const LOGO_BG = [
  "bg-indigo-600", "bg-violet-600", "bg-blue-600", "bg-sky-600",
  "bg-emerald-600", "bg-teal-600", "bg-amber-600", "bg-rose-600",
];
function logoColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return LOGO_BG[Math.abs(h) % LOGO_BG.length];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  ACCELERATOR: Rocket,
  VENTURE_STUDIO: Building2,
  INCUBATOR: Lightbulb,
  ANGEL_NETWORK: Network,
  GRANT: Award,
};

export default async function HomePage() {
  const [stats, featured, upcoming] = await Promise.all([getStats(), getFeatured(), getUpcoming()]);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%)",
          }}
        />
       <div className="relative mx-auto max-w-full sm:max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
              <Zap className="h-3.5 w-3.5" />
              {stats.total} programmes tracked across the UK &amp; Europe
            </div>
           <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
  Find the right <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">accelerator</span> for your startup
</h1>
<p className="mb-8 max-w-xl text-lg leading-relaxed text-zinc-300">
  Stop joining whatever programme is in front of you. Search and filter every accelerator,
  venture studio, and investor across the UK and Europe by sector, stage, location,
  SEIS/EIS eligibility, and more.
</p>
            <div className="flex flex-wrap gap-3">
              <Button href="/find" size="lg">
                Find my match <Zap className="h-4 w-4" />
              </Button>
              <Button href="/directory" variant="secondary" size="lg">
                Browse directory <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/alerts" variant="secondary" size="lg">
                <Bell className="h-4 w-4" />
                Get alerts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
     <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-800">
  {[
    { label: "Accelerators", value: stats.byType["ACCELERATOR"] ?? 0, icon: Rocket },
    { label: "Venture Studios", value: stats.byType["VENTURE_STUDIO"] ?? 0, icon: Building2 },
    { label: "Incubators", value: stats.byType["INCUBATOR"] ?? 0, icon: Lightbulb },
    { label: "Grants & Other", value: (stats.byType["ANGEL_NETWORK"] ?? 0) + (stats.byType["GRANT"] ?? 0), icon: Award },
  ].map(({ label, value, icon: Icon }) => (
    <div key={label} className="flex items-center justify-center gap-3 px-4 py-3 sm:px-6 sm:py-5">
      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/20">
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  ))}
</div>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white">Built for founders who do their homework</h2>
          <p className="mt-2 text-zinc-500">Everything you need to pick the right programme</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Search, title: "Smart search & filters", desc: "Filter by sector, stage, location, SEIS/EIS eligibility, equity terms, cohort size and more." },
            { icon: Bookmark, title: "Save favourites", desc: "Build a shortlist of programmes you're interested in. No account needed." },
            { icon: Star, title: "Founder reviews", desc: "Real reviews from founders who went through each programme — before you give up equity." },
            { icon: Bell, title: "Deadline alerts", desc: "Get notified when applications open for programmes that match your startup's profile." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-600/10">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="mb-1.5 font-semibold text-zinc-100">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured programmes ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-zinc-900/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Featured programmes</h2>
                <p className="mt-1 text-sm text-zinc-500">Handpicked for quality and founder experience</p>
              </div>
              <Button href="/directory" variant="ghost" size="sm">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProgrammeCard key={p.slug} programme={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Applications closing soon ───────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Applications closing soon</h2>
              <p className="mt-1 text-sm text-zinc-500">Don&apos;t miss these deadlines</p>
            </div>
            <Button href="/directory" variant="ghost" size="sm">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {upcoming.map((p) => {
              const days = p.applicationDeadline
                ? Math.ceil((p.applicationDeadline.getTime() - Date.now()) / 86_400_000)
                : null;
              return (
                <Link
                  key={p.slug}
                  href={`/programme/${p.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${logoColor(p.name)}`}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100 group-hover:text-white transition-colors">{p.name}</p>
                      <p className="text-sm text-zinc-500">{TYPE_LABELS[p.type]} · {p.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {days !== null && (
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold ${days <= 7 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-800 text-zinc-400"}`}>
                        {days === 0 ? "Today" : days === 1 ? "1 day left" : `${days} days left`}
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Browse by type ──────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Browse by type</h2>
            <Link href="/directory" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(TYPE_LABELS).filter(([type]) => type !== "VC").map(([type, label]) => {
              const Icon = TYPE_ICONS[type] ?? Rocket;
              return (
                <Link
                  key={type}
                  href={`/directory?type=${type}`}
                  className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 transition-all hover:border-indigo-500/40 hover:bg-zinc-800/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 transition-colors group-hover:border-indigo-500/40 group-hover:bg-indigo-600/10">
                    <Icon className="h-5 w-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">{label}</p>
                    <p className="text-xs text-zinc-600">{stats.byType[type] ?? 0} programmes</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700 transition-colors group-hover:text-indigo-400" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 bg-gradient-to-br from-indigo-950/50 to-zinc-950 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-600/10">
            <Bell className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white">Never miss an application deadline</h2>
          <p className="mb-6 text-zinc-400">
            Set your preferences once — sector, stage, location — and we&apos;ll email you when
            matching programmes open applications.
          </p>
          <Button href="/alerts" size="lg">
            Set up alerts <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
