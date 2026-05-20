import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdSlot } from "@/components/ui/AdSlot";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.description };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/blog" className="mb-8 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">{post.category}</span>
          {post.readTime && <span className="text-xs text-zinc-600">{post.readTime}</span>}
        </div>
        <h1 className="text-3xl font-bold text-white leading-tight">{post.title}</h1>
        <p className="mt-3 text-zinc-400">{post.description}</p>
        <p className="mt-2 text-xs text-zinc-600">{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </header>

      <AdSlot slot="blog-top" format="horizontal" className="mb-8" />

      <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-zinc-200 prose-blockquote:border-indigo-500 prose-blockquote:text-zinc-400">
        <MDXRemote source={post.content} />
      </div>

      <AdSlot slot="blog-bottom" format="rectangle" className="mt-8" />

      <div className="mt-8 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
        <h3 className="font-semibold text-white">Ready to find your programme?</h3>
        <p className="mt-1 text-sm text-zinc-400">Browse the full UK & European directory or let our matching tool do the work.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/find" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">Find my match</Link>
          <Link href="/directory" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-600">Browse directory</Link>
        </div>
      </div>
    </div>
  );
}
