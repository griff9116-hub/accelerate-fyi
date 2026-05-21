"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

export function AdSlot({ slot, format = "auto", className }: AdSlotProps) {
  const pushed = useRef(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cookie_consent") === "accepted") setConsented(true);
    const handler = () => setConsented(true);
    window.addEventListener("cookie_consent_accepted", handler);
    return () => window.removeEventListener("cookie_consent_accepted", handler);
  }, []);

  useEffect(() => {
    if (!consented || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded
    }
  }, [consented]);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT || !consented) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
