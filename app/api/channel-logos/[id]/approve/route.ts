import { NextResponse } from "next/server";
import { updateChannelLogoStatus } from "@/lib/channel-logos";

export const dynamic = "force-dynamic";

export function POST(_request: Request, { params }: { params: { id: string } }) {
  const result = updateChannelLogoStatus(params.id, "approved");
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
