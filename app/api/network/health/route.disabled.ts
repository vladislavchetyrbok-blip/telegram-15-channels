import { NextResponse } from "next/server";
import { getNetworkHealth, listNetworkLogs } from "@/lib/network-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getNetworkHealth();

  return NextResponse.json({
    ...health,
    logs: listNetworkLogs(),
  });
}
