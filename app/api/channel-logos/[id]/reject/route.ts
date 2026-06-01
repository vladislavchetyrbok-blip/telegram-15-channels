import { NextResponse } from "next/server";
import { updateChannelLogoStatus } from "@/lib/channel-logos";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => ({}))) as { notes?: string };
  const result = updateChannelLogoStatus(params.id, "rejected", body.notes);

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
