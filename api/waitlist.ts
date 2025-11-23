import type { VercelRequest, VercelResponse } from "@vercel/node";

type WaitlistBody = {
  fullName?: string;
  name?: string;
  email?: string;
  traderType?: string;
  goal?: string;
  notes?: string;
  source?: string;
  createdAt?: string;
};

function normaliseName(body: WaitlistBody) {
  return body.fullName?.trim() || body.name?.trim() || "";
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as WaitlistBody;
  const fullName = normaliseName(body);
  const email = body.email?.trim().toLowerCase() ?? "";
  const traderType = body.traderType?.trim() || "";
  const goal = (body.goal ?? body.notes ?? "").toString().trim();
  const source = body.source ?? "website-waitlist";
  const createdAt = body.createdAt ?? new Date().toISOString();

  if (!fullName || !email) {
    res.status(400).json({ ok: false, error: "Missing required fields" });
    return;
  }

  console.log("Waitlist submission received", {
    fullName,
    email,
    traderType,
    goal,
    source,
    createdAt
  });

  res.status(200).json({ ok: true });
}


