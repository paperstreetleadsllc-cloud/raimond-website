import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { name = "", email = "", notes = "" } = req.body ?? {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ ok: false, error: "Email required" });
    }

    const html = `
      <h2>New RAimond beta request</h2>
      <p><b>Name:</b> ${name || "(n/a)"}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Notes:</b><br/>${(notes || "").replace(/\n/g,"<br/>")}</p>
    `;

    await resend.emails.send({
      from: "RAimond Beta <noreply@raimondai.com>",
      to: ["support@raimondai.com"],
      subject: "New Beta Request",
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Email send failed" });
  }
}