import { NextResponse } from "next/server";
import { getChannelAnalytics, listNetworkLogs } from "@/lib/network-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    telegramSent: false,
    channels: getChannelAnalytics(),
    logs: listNetworkLogs(),
  });
}
