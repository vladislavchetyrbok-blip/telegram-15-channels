import { NextResponse } from "next/server";
import { generateWeeklyContentPlan } from "@/lib/content-plan-store";

export async function POST() {
  const result = await generateWeeklyContentPlan();

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      items: result.items,
      error: result.error,
    },
    { status: result.ok ? 200 : 400 },
  );
}
