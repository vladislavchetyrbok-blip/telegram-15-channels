import { NextResponse } from "next/server";
import { runFullSystemCheck } from "@/lib/network-analytics";

export async function POST() {
  const result = await runFullSystemCheck();

  return NextResponse.json({
    ok: result.ok,
    mode: "dry-run",
    telegram: result.telegram,
    ai: {
      provider: result.ai.provider,
      connected: result.ai.connected,
      model: result.ai.model,
    },
    content: result.content,
    safety: result.safety,
    warnings: result.warnings,
    checkedAt: result.checkedAt,
  });
}
