import { NextResponse } from "next/server";
import { listDryRunPostLogs } from "@/lib/post-draft-store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    dryRun: true,
    telegramSent: false,
    logs: listDryRunPostLogs(),
  });
}
