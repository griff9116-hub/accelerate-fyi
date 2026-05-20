"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie_consent_accepted"));
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="text-sm text-zinc-400">
          We use cookies for analytics and advertising.{" "}
          <a href="/about" className="text-indigo-400 hover:underline">
            Learn more
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={decline}
            className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Accept
          </button>
          <button onClick={decline} className="text-zinc-600 hover:text-zinc-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
