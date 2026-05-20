import type { Metadata } from "next";
import Link from "next/link";
import { Mail, TrendingUp, Users, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach UK startup founders actively searching for accelerators, venture studios, and investors. Advertise on Accelerate.fyi.",
};

const FORMATS = [
  {
    title: "Sponsored listing",
    desc: "Your programme appears at the top of relevant search results with a 'Sponsored' badge. Ideal for accelerators with open applications.",
    price: "From £500/month",
    icon: Star,
  },
  {
    title: "Featured programme",
    desc: "Highlighted card in the directory with a featured badge. Permanent placement above standard listings.",
    price: "From £300/month",
    icon: TrendingUp,
  },
  {
    title: "Display advertising",
    desc: "Banner placements across directory and blog pages. Targeted to founders at specific stages or sectors.",
    price: "CPM pricing",
    icon: Users,
  },
];

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white">Advertise on Accelerate.fyi</h1>
        <p className="mt-4 text-lg text-zinc-400">
          Reach UK founders at the exact moment they&apos;re researching programmes to apply to.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Monthly visitors", value: "10k+" },
          { label: "Avg. session duration", value: "4 min" },
          { label: "Bounce rate", value: "< 40%" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-3xl font-bold text-indigo-400">{value}</p>
            <p className="mt-1 text-sm text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Audience */}
      <div className="mb-16 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Our audience</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Early-stage founders (pre-seed to seed)",
            "Technical co-founders researching programmes",
            "First-time founders in the UK",
            "Operators looking to start their first company",
            "Founders actively applying to accelerators",
            "Angel investors tracking the ecosystem",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-zinc-400">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Ad formats */}
      <h2 className="mb-6 text-xl font-semibold text-white">Ad formats</h2>
      <div className="mb-16 grid gap-4 sm:grid-cols-3">
        {FORMATS.map(({ title, desc, price, icon: Icon }) => (
          <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{desc}</p>
            <p className="mt-4 text-sm font-medium text-indigo-400">{price}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Get in touch</h2>
        <p className="mt-2 text-zinc-400">
          For rates, availability, and custom packages, email us directly.
        </p>
        <a
          href="mailto:hello@accelerate.fyi"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          <Mail className="h-4 w-4" />
          hello@accelerate.fyi
        </a>
        <p className="mt-4 text-xs text-zinc-600">
          Or{" "}
          <Link href="/submit" className="text-zinc-400 hover:text-zinc-200">
            submit your programme <ArrowRight className="inline h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
