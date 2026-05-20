import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span>Accelerate<span className="text-indigo-400">.fyi</span></span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              The most comprehensive directory of accelerators, venture studios, and investors across the UK and Europe.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-zinc-300">Directory</p>
              <Link href="/directory" className="text-zinc-500 hover:text-zinc-300">All programmes</Link>
              <Link href="/accelerators" className="text-zinc-500 hover:text-zinc-300">Accelerators</Link>
              <Link href="/venture-studios" className="text-zinc-500 hover:text-zinc-300">Venture Studios</Link>
              <Link href="/vcs" className="text-zinc-500 hover:text-zinc-300">VCs</Link>
              <Link href="/london" className="text-zinc-500 hover:text-zinc-300">London</Link>
              <Link href="/europe" className="text-zinc-500 hover:text-zinc-300">Europe</Link>
              <Link href="/germany" className="text-zinc-500 hover:text-zinc-300">Germany</Link>
              <Link href="/france" className="text-zinc-500 hover:text-zinc-300">France</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-zinc-300">Tools</p>
              <Link href="/find" className="text-zinc-500 hover:text-zinc-300">Find my match</Link>
              <Link href="/saved" className="text-zinc-500 hover:text-zinc-300">Saved</Link>
              <Link href="/alerts" className="text-zinc-500 hover:text-zinc-300">Deadline alerts</Link>
              <Link href="/submit" className="text-zinc-500 hover:text-zinc-300">Submit a programme</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-zinc-300">Company</p>
              <Link href="/about" className="text-zinc-500 hover:text-zinc-300">About</Link>
              <Link href="/blog" className="text-zinc-500 hover:text-zinc-300">Blog</Link>
              <Link href="/advertise" className="text-zinc-500 hover:text-zinc-300">Advertise</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-6 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Accelerate.fyi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
