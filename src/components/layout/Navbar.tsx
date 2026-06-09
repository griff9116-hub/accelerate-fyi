"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Bell, Menu, X, Sparkles, PlusCircle, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/directory", label: "Directory" },
  { href: "/blog", label: "Blog" },
  { href: "/saved", label: "Saved" },
  { href: "/alerts", label: "Alerts" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span>Accelerate<span className="text-indigo-400">.fyi</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/submit"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === "/submit"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            Submit
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/match-deck"
            className="hidden items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors sm:flex"
          >
            <FileText className="h-3.5 w-3.5" />
            Match my deck
          </Link>
          <Link
            href="/find"
            className="hidden items-center gap-1.5 rounded-lg border border-indigo-500/40 px-3 py-1.5 text-sm font-medium text-indigo-400 hover:border-indigo-500 hover:text-indigo-300 transition-colors sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Find my match
          </Link>
          <Link
            href="/alerts"
            className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors sm:flex"
          >
            <Bell className="h-3.5 w-3.5" />
            Get alerts
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-100 sm:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 pb-4 pt-2 sm:hidden">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/submit"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Submit a programme
          </Link>
          <Link
            href="/match-deck"
            onClick={() => setOpen(false)}
            className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Match my deck
          </Link>
          <Link
            href="/find"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg border border-indigo-500/40 px-3 py-2.5 text-sm font-medium text-indigo-400"
          >
            <Sparkles className="h-4 w-4" />
            Find my match
          </Link>
          <Link
            href="/alerts"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white"
          >
            <Bell className="h-4 w-4" />
            Get alerts
          </Link>
        </div>
      )}
    </header>
  );
}
