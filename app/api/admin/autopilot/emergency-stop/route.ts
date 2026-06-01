import { NextResponse } from "next/server";
import { triggerAutopilotEmergencyStop } from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "admin_endpoint_emergency_stop";

  return NextResponse.json(await triggerAutopilotEmergencyStop(reason));
}
