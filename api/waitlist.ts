import { createClient } from "@supabase/supabase-js";
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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase configuration in environment variables.");
}

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  if (!supabase) {
    res.status(500).json({ error: "Supabase not configured" });
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

  try {
    const { error } = await supabase
      .from("waitlist_leads")
      .insert({
        full_name: fullName,
        email,
        trader_type: traderType || null,
        goal: goal || null,
        created_at: createdAt
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      res.status(500).json({ error: "Failed to save waitlist entry" });
      return;
    }

    console.log("RAImond waitlist lead stored", {
      email
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Unexpected waitlist handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}






