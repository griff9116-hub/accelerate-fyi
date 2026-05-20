import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://accelerate-fyi.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, posts] = await Promise.all([
    prisma.programme.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    getAllPosts(),
  ]);

  const static_routes = [
    { url: BASE, changeFrequency: "daily" as const, priority: 1 },
    { url: `${BASE}/directory`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/find`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE}/accelerators`, changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${BASE}/venture-studios`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/vcs`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/london`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${BASE}/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/alerts`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/submit`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE}/advertise`, changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const programme_routes = programmes.map((p) => ({
    url: `${BASE}/programme/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blog_routes = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...static_routes, ...programme_routes, ...blog_routes];
}
