import { NextResponse } from "next/server";
import { getChannelStatsSummary, listChannelStats, refreshChannelStatsFromTelegram } from "@/lib/channel-stats";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    telegramSent: false,
    summary: getChannelStatsSummary(),
    stats: listChannelStats(),
  });
}

export function POST() {
  const result = refreshChannelStatsFromTelegram();

  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
