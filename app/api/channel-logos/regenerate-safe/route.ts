import { NextResponse } from "next/server";
import { getChannelLogoAudit, regenerateUnsafeChannelLogos } from "@/lib/channel-logos";

export const dynamic = "force-dynamic";

export function POST() {
  const regeneration = regenerateUnsafeChannelLogos();
  const audit = getChannelLogoAudit();

  return NextResponse.json({
    ...regeneration,
    audit,
  });
}
