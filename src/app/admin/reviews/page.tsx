import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { StarRating } from "@/components/ui/StarRating";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: { programme: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Reviews</h1>
      <p className="mb-6 text-sm text-zinc-500">{reviews.length} pending approval</p>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <p className="text-zinc-500">No pending reviews.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-zinc-200">{r.authorName}</p>
                  <p className="text-xs text-zinc-500">
                    on <span className="text-indigo-400">{r.programme.name}</span>
                    {r.cohortYear && ` · Cohort ${r.cohortYear}`}
                    {" · "}{new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>
                  <div className="mt-1">
                    <StarRating rating={r.overallRating} />
                  </div>
                </div>
                <AdminReviewActions id={r.id} />
              </div>
              <p className="text-sm text-zinc-400 line-clamp-3">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
