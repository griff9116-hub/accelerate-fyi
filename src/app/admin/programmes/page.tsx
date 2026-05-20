import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { AdminProgrammeToggle } from "@/components/admin/AdminProgrammeToggle";
import { TYPE_LABELS } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

export default async function AdminProgrammesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const programmes = await prisma.programme.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, slug: true, name: true, type: true, location: true,
      isActive: true, isFeatured: true, isSponsored: true,
      submitterEmail: true, createdAt: true,
    },
  });

  const pending = programmes.filter((p) => !p.isActive);
  const active = programmes.filter((p) => p.isActive);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Programmes</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-400">
            Pending ({pending.length})
          </h2>
          <ProgrammeTable rows={pending} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Active ({active.length})
        </h2>
        <ProgrammeTable rows={active} />
      </div>
    </div>
  );
}

type Row = {
  id: string; slug: string; name: string; type: string; location: string;
  isActive: boolean; isFeatured: boolean; isSponsored: boolean;
  submitterEmail: string | null; createdAt: Date;
};

function ProgrammeTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Type</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Flags</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/programme/${p.slug}`} target="_blank" className="font-medium text-zinc-200 hover:text-indigo-400">
                    {p.name}
                  </Link>
                  <ExternalLink className="h-3 w-3 text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-600">{p.location}{p.submitterEmail && ` · ${p.submitterEmail}`}</p>
              </td>
              <td className="px-4 py-3 text-zinc-400">{TYPE_LABELS[p.type] ?? p.type}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  {p.isFeatured && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">Featured</span>}
                  {p.isSponsored && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">Sponsored</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <AdminProgrammeToggle id={p.id} isActive={p.isActive} isFeatured={p.isFeatured} isSponsored={p.isSponsored} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
