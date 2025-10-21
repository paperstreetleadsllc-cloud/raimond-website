import type { VercelRequest, VercelResponse } from "@vercel/node";

type Payload = { name?: string; email?: string; notes?: string };

async function subscribeConvertKit(email: string, name?: string, notes?: string) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;
  if (!apiKey || !formId) throw new Error("Missing CONVERTKIT_API_KEY or CONVERTKIT_FORM_ID");
  const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;
  const body = {
    api_key: apiKey,
    email,
    first_name: name || "",
    fields: { notes: notes || "" },
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`ConvertKit error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { ok: true, provider: "convertkit", data };
}

async function subscribeMailchimp(email: string, name?: string, notes?: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC; // e.g., us21
  if (!apiKey || !listId || !dc) throw new Error("Missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID or MAILCHIMP_DC");
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;
  const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");
  const body = {
    email_address: email,
    status: "pending", // or "subscribed" if you don't want double opt-in
    merge_fields: { FNAME: name || "" , NOTES: notes || "" }
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` }, body: JSON.stringify(body) });
  // Mailchimp returns 400 if already subscribed; treat as ok idempotently
  if (res.status === 400) {
    const txt = await res.text();
    if (txt.includes("Member Exists")) return { ok: true, provider: "mailchimp", data: { status: "exists" } };
    throw new Error(`Mailchimp 400: ${txt}`);
  }
  if (!res.ok) throw new Error(`Mailchimp error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { ok: true, provider: "mailchimp", data };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { name, email, notes } = (req.body || {}) as Payload;
    if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });

    const provider = (process.env.ESP_PROVIDER || "").toLowerCase();
    let result;
    if (provider === "convertkit") {
      result = await subscribeConvertKit(email, name, notes);
    } else if (provider === "mailchimp") {
      result = await subscribeMailchimp(email, name, notes);
    } else {
      return res.status(500).json({ error: "ESP_PROVIDER must be 'convertkit' or 'mailchimp'" });
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}