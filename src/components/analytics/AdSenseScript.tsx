"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export function AdSenseScript() {
  const [consented, setConsented] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    const stored = localStorage.getItem("cookie_consent");
    if (stored === "accepted") setConsented(true);

    const handler = () => setConsented(true);
    window.addEventListener("cookie_consent_accepted", handler);
    return () => window.removeEventListener("cookie_consent_accepted", handler);
  }, []);

  if (!clientId || !consented) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
