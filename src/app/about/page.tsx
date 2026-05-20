import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Star, Bell, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Accelerate.fyi",
  description: "Why we built the UK's most comprehensive directory of accelerators, venture studios, and investors — and how it helps founders pick the right programme.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white">About Accelerate.fyi</h1>
        <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
          The UK&apos;s most comprehensive directory of accelerators, venture studios, and investors — built by founders, for founders.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-white">The problem we&apos;re solving</h2>
        <p className="text-zinc-400 leading-relaxed">
          Too many UK founders join the first accelerator programme they come across — a local Natwest programme, a Growth Forge cohort, a corporate accelerator from their bank — without ever knowing what else is out there. These programmes are often generic, not matched to the founder&apos;s sector or stage, and may not be the best use of equity.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          Meanwhile, the UK has some of the world&apos;s best accelerators, venture studios, and early-stage investors: Entrepreneur First, Seedcamp, Antler, Bethnal Green Ventures, Octopus Ventures, and dozens more. The problem isn&apos;t a lack of options — it&apos;s a lack of visibility.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-white">What Accelerate.fyi does</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Search, title: "Comprehensive directory", desc: "Every UK accelerator, venture studio, VC, angel network, incubator, and grant programme in one place." },
            { icon: Star, title: "Founder reviews", desc: "Real reviews from founders who went through each programme — before you hand over equity." },
            { icon: Bell, title: "Deadline alerts", desc: "Sign up once, tell us your sector and stage, get notified when matching programmes open applications." },
            { icon: Zap, title: "Find your match", desc: "Answer 5 questions about your startup and get a ranked shortlist of programmes most likely to be right for you." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/20">
                <Icon className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-zinc-200">{title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold text-white">Who it&apos;s for</h2>
        <p className="text-zinc-400 leading-relaxed">
          Accelerate.fyi is for any UK-based startup or scale-up founder who is evaluating whether to apply to an accelerator or seek investment — and wants to make that decision with full information rather than incomplete knowledge.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          It&apos;s also for accelerator programmes themselves: a free listing means your programme is discoverable by exactly the founders you want to attract.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-white">Data and listings</h2>
        <p className="text-zinc-400 leading-relaxed">
          All listings are manually curated and verified. Programmes can submit themselves for free. We do not charge for inclusion — sponsored and featured placements are clearly marked.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          If you run an accelerator, VC, or venture studio and want to claim or update your listing, use the submit form or email us directly.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/directory" size="lg">Browse directory <ArrowRight className="h-4 w-4" /></Button>
          <Button href="/submit" variant="secondary" size="lg">Submit your programme</Button>
        </div>
      </div>
    </div>
  );
}
