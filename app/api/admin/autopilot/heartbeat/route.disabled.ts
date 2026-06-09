import { NextResponse } from "next/server";
import { markWorkerHeartbeatInRuntime } from "@/lib/admin-reports";
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

  return NextResponse.json(
    markWorkerHeartbeatInRuntime({
      at: typeof body.at === "string" ? body.at : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      error: typeof body.error === "string" ? body.error : null,
    }),
  );
}
