import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Deck Leads — Admin" };
export const dynamic = "force-dynamic";

export default async function DeckLeadsPage() {
  const leads = await prisma.deckReview.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Deck Leads</h1>
        <p className="mt-1 text-sm text-zinc-500">{leads.length} submissions</p>
      </div>

      {leads.length === 0 ? (
        <p className="text-zinc-500">No deck submissions yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Sectors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-500">
                    {lead.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    <a href={`mailto:${lead.email}`} className="hover:text-indigo-400">{lead.email}</a>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{lead.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{lead.stage ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{lead.sectors.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
