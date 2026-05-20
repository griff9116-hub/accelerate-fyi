import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-800/50">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">{post.category}</span>
        {post.readTime && <span className="text-xs text-zinc-600">{post.readTime}</span>}
      </div>
      <h2 className="mb-2 font-semibold text-zinc-100 group-hover:text-white leading-snug">{post.title}</h2>
      <p className="flex-1 text-sm text-zinc-500 line-clamp-2">{post.description}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400">
        Read more <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
