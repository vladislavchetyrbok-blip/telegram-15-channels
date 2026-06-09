import { NextResponse } from "next/server";
import { getNetworkAnalytics, listNetworkLogs } from "@/lib/network-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    analytics: getNetworkAnalytics(),
    logs: listNetworkLogs(),
  });
}
