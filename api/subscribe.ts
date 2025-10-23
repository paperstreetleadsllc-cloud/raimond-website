import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const { name, email } = data;

  console.log("🟢 New beta signup:", name, email);

  // Simulate a database insert or external API call
  return NextResponse.json({
    success: true,
    message: `Thanks ${name || "trader"}! You’re on the RAImond beta waitlist.`,
  });
}