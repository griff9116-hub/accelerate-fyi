import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

interface ProgrammeEmailData {
  name: string;
  slug: string;
  type: string;
  location: string;
  equityTaken: number | null;
  investmentMin: number | null;
  investmentMax: number | null;
  applicationDeadline: Date | null;
}

export function buildAlertEmail(programmes: ProgrammeEmailData[]): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://accelerate-fyi.vercel.app";

  const rows = programmes.map((p) => {
    const deadline = p.applicationDeadline
      ? p.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "Rolling";
    const equity = p.equityTaken === 0 ? "Equity-free" : p.equityTaken ? `${p.equityTaken}%` : "Undisclosed";

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#f4f4f5;">${p.name}</p>
            <p style="margin:0 0 8px;font-size:13px;color:#71717a;">${p.type.replace(/_/g, " ")} &middot; ${p.location}</p>
            <p style="margin:0 0 12px;font-size:13px;color:#a1a1aa;">Equity: ${equity} &middot; Deadline: ${deadline}</p>
            <a href="${base}/programme/${p.slug}" style="display:inline-block;background:#6366f1;color:#fff;font-size:13px;font-weight:500;padding:8px 16px;border-radius:8px;text-decoration:none;">View programme &rarr;</a>
          </td>
        </tr>
      </table>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding-bottom:24px;border-bottom:1px solid #27272a;margin-bottom:24px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">⚡ Accelerate<span style="color:#818cf8;">.fyi</span></p>
          </td>
        </tr>
        <tr><td style="padding:24px 0 16px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f4f4f5;">${programmes.length} new programme${programmes.length > 1 ? "s" : ""} matching your preferences</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#71717a;">We found these programmes you haven't seen yet.</p>
          ${rows}
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:12px;color:#52525b;">You're receiving this because you signed up for alerts at <a href="${base}/alerts" style="color:#818cf8;">accelerate-fyi.vercel.app/alerts</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
