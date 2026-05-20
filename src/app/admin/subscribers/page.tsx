import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AdminSubscribersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const subscribers = await prisma.alertSubscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { matches: true } } },
  });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Alert Subscribers</h1>
      <p className="mb-6 text-sm text-zinc-500">{subscribers.length} total</p>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Preferences</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Matched</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3 text-zinc-200">{s.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.sectors.slice(0, 2).map((x) => <span key={x} className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{x}</span>)}
                    {s.stages.slice(0, 2).map((x) => <span key={x} className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{x}</span>)}
                    {s.seisOnly && <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs text-green-400">SEIS only</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">{s._count.matches}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(s.createdAt).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
