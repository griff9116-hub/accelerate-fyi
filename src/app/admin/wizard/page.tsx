import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { STAGE_LABELS } from "@/lib/constants";

export default async function AdminWizardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const responses = await prisma.wizardResponse.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const withEmail = responses.filter((r) => r.email);
  const byCountry: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  for (const r of responses) {
    byCountry[r.country] = (byCountry[r.country] ?? 0) + 1;
    byStage[r.stage] = (byStage[r.stage] ?? 0) + 1;
  }

  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topStages = Object.entries(byStage).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Wizard Leads</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total responses", value: responses.length },
          { label: "With email", value: withEmail.length },
          { label: "Email rate", value: responses.length ? `${Math.round((withEmail.length / responses.length) * 100)}%` : "—" },
          { label: "Countries", value: Object.keys(byCountry).length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-400">Top countries</h2>
          {topCountries.map(([country, count]) => (
            <div key={country} className="flex items-center justify-between border-b border-zinc-800 py-2 last:border-0">
              <span className="text-sm text-zinc-300">{country}</span>
              <span className="text-sm font-medium text-zinc-400">{count}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-400">Stages</h2>
          {topStages.map(([stage, count]) => (
            <div key={stage} className="flex items-center justify-between border-b border-zinc-800 py-2 last:border-0">
              <span className="text-sm text-zinc-300">{STAGE_LABELS[stage] ?? stage}</span>
              <span className="text-sm font-medium text-zinc-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Date</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Stage</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Country</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Sectors</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3">
                  {r.email ? (
                    <a href={`mailto:${r.email}`} className="text-indigo-400 hover:underline">{r.email}</a>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-300">{STAGE_LABELS[r.stage] ?? r.stage}</td>
                <td className="px-4 py-3 text-zinc-300">{r.country}</td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{r.priority.replace("_", " ")}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{r.sectors.slice(0, 2).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {responses.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500">No wizard responses yet.</p>
        )}
      </div>
    </div>
  );
}
