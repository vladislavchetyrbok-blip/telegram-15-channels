import { NextResponse } from "next/server";
import { markWorkerHeartbeatInRuntime } from "@/lib/admin-reports";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    markWorkerHeartbeatInRuntime({
      at: typeof body.at === "string" ? body.at : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      error: typeof body.error === "string" ? body.error : null,
    }),
  );
}
