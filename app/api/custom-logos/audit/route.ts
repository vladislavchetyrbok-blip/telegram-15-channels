import { NextResponse } from "next/server";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { getCustomLogoAudit } from "@/lib/custom-logos";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getCustomLogoAudit(channelGenerationConfigs.map((channel) => channel.id)));
}
