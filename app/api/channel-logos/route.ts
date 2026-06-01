import { NextResponse } from "next/server";
import { getLogoUploadDirRelative, listChannelLogos } from "@/lib/channel-logos";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    telegramSent: false,
    uploadDir: getLogoUploadDirRelative(),
    logos: listChannelLogos(),
  });
}
