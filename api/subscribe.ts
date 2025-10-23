import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { name = "", email = "", note = "", hp = "" } = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) || {};

    // Simple validation + honeypot
    if (hp) return res.status(200).json({ ok: true, message: "Thanks!" });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ ok: false, message: "Please enter a valid email." });
    }

    const toAddress = "support@raimondai.com"; // ← change if you want
    const fromAddress = "RAIMOND <notifications@raimondai.com>"; // works best if you verify domain in Resend
    const fallbackFrom = "RAIMOND Beta <onboarding@resend.dev>"; // safe fallback if domain not verified

    await resend.emails.send({
      from: process.env.RESEND_FROM || fromAddress,
      to: [toAddress],
      subject: "New RAIMOND beta signup",
      text: [
        "New beta signup:",
        `Name: ${name || "(not provided)"}`,
        `Email: ${email}`,
        note ? `Note: ${note}` : null,
        "",
        `Time: ${new Date().toISOString()}`,
      ].filter(Boolean).join("\n"),
      reply_to: email
    });

    return res.status(200).json({ ok: true, message: "Thanks — you’re on the list! We’ll email next steps." });
  } catch (err: any) {
    console.error(err);
    const msg = !process.env.RESEND_API_KEY
      ? "Server email not configured."
      : "Could not send email. Please try again.";
    return res.status(500).json({ ok: false, message: msg });
  }
}