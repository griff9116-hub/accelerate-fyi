import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AdSenseScript } from "@/components/analytics/AdSenseScript";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Accelerate.fyi — European Accelerator & VC Directory", template: "%s | Accelerate.fyi" },
  description: "Find the right accelerator, venture studio, or investor across the UK and Europe. Filter by sector, stage, location, SEIS/EIS, equity terms and more.",
  openGraph: {
    title: "Accelerate.fyi — European Accelerator & VC Directory",
    description: "Find the right accelerator, venture studio, or investor across the UK and Europe.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <GoogleAnalytics />
        <AdSenseScript />
        <Analytics />
      </body>
    </html>
  );
}
