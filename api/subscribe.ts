import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// very light in-memory rate limiting (per IP)
const hits = new Map<string, { count: number; ts: number }>();
function tooMany(req: VercelRequest, limit = 5, windowMs = 60_000) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "ip";
  const now = Date.now();
  const rec = hits.get(ip) ?? { count: 0, ts: now };
  if (now - rec.ts > windowMs) { rec.count = 0; rec.ts = now; }
  rec.count++; hits.set(ip, rec);
  return rec.count > limit;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  if (tooMany(req)) return res.status(429).json({ message: "Too many requests. Try again in a minute." });

  const { name = "", email = "", honeypot = "" } = req.body || {};
  if (honeypot) return res.status(200).json({ message: "Thanks!" }); // quiet drop
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please use a valid email." });

  try {
    await resend.emails.send({
      from: "RAIMOND <noreply@raimondai.com>",
      to: ["support@raimondai.com"],
      subject: "New Beta Request",
      html: `
        <h2>New RAIMOND beta request</h2>
        <p><b>Name:</b> ${String(name).slice(0,120)}</p>
        <p><b>Email:</b> ${email}</p>
      `,
    });
    return res.status(200).json({ message: "You're on the list!" });
  } catch (e: any) {
    const msg = e?.message || "Email failed";
    return res.status(500).json({ message: "Something went wrong.", detail: msg });
  }
}
