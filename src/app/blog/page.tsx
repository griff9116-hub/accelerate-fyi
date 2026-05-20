import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog/PostCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Accelerate.fyi",
  description: "Guides, comparisons, and resources for UK founders navigating accelerators, VCs, and fundraising.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Founder resources</h1>
        <p className="mt-2 text-zinc-500">Guides and comparisons to help you pick the right programme.</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-zinc-500">Posts coming soon.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
      )}
    </div>
  );
}
