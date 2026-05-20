import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Star, Building2, Users, CheckCircle, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const [pendingReviews, pendingSubmissions, subscribers, totalProgrammes] = await Promise.all([
    prisma.review.count({ where: { isApproved: false } }),
    prisma.programme.count({ where: { isActive: false } }),
    prisma.alertSubscription.count({ where: { isActive: true } }),
    prisma.programme.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Pending reviews", value: pendingReviews, href: "/admin/reviews", icon: Star, urgent: pendingReviews > 0 },
    { label: "Pending submissions", value: pendingSubmissions, href: "/admin/programmes", icon: Building2, urgent: pendingSubmissions > 0 },
    { label: "Alert subscribers", value: subscribers, href: "/admin/subscribers", icon: Users, urgent: false },
    { label: "Active programmes", value: totalProgrammes, href: "/admin/programmes", icon: CheckCircle, urgent: false },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon, urgent }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${urgent ? "bg-amber-500/10 border border-amber-500/20" : "bg-zinc-800"}`}>
              <Icon className={`h-5 w-5 ${urgent ? "text-amber-400" : "text-zinc-400"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${urgent ? "text-amber-400" : "text-white"}`}>{value}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
            <ArrowRight className="h-4 w-4 self-end text-zinc-700" />
          </Link>
        ))}
      </div>
    </div>
  );
}
