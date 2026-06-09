import { NextResponse } from "next/server";
import { triggerAutopilotEmergencyStop } from "@/lib/autopublish";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getManualWriteBlock } from "@/lib/production-safety";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  const block = getManualWriteBlock();
  if (block.blocked) {
    return NextResponse.json(block.response, { status: block.statusCode });
  }

  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "admin_endpoint_emergency_stop";

  return NextResponse.json(await triggerAutopilotEmergencyStop(reason));
}
