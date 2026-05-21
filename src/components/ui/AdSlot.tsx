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
  const insRef = useRef<HTMLModElement>(null);
  const [consented, setConsented] = useState(false);
  const [hasAd, setHasAd] = useState(false);

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

  // Only apply wrapper spacing once an ad has actually filled the slot
  useEffect(() => {
    if (!consented || !insRef.current) return;
    const el = insRef.current;
    const observer = new ResizeObserver(() => {
      if (el.offsetHeight > 0) setHasAd(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [consented]);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT || !consented) return null;

  return (
    <div className={hasAd ? className : undefined}>
      <ins
        ref={insRef}
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
