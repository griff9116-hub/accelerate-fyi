import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInvestment(min?: number | null, max?: number | null, currency = "GBP"): string {
  if (!min && !max) return "Undisclosed";
  const symbols: Record<string, string> = { GBP: "£", EUR: "€", USD: "$" };
  const sym = symbols[currency] ?? `${currency} `;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${sym}${n / 1_000_000}m` : n >= 1_000 ? `${sym}${n / 1_000}k` : `${sym}${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function formatDeadline(date: Date | null | undefined): {
  label: string;
  urgent: boolean;
} {
  if (!date) return { label: "Rolling", urgent: false };
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Closed", urgent: false };
  if (days === 0) return { label: "Closes today", urgent: true };
  if (days <= 7) return { label: `${days}d left`, urgent: true };
  if (days <= 30) return { label: `${days}d left`, urgent: false };
  return { label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), urgent: false };
}

export function formatEquity(pct?: number | null): string {
  if (pct === null || pct === undefined) return "Undisclosed";
  if (pct === 0) return "Equity-free";
  return `${pct}%`;
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function avgRating(ratings: (number | null | undefined)[]): number | null {
  const valid = ratings.filter((r): r is number => r != null);
  if (!valid.length) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}
