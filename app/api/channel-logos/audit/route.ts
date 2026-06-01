import { NextResponse } from "next/server";
import { getChannelLogoAudit } from "@/lib/channel-logos";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getChannelLogoAudit());
}
