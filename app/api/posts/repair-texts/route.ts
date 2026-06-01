import { NextResponse } from "next/server";
import { repairBadDraftTexts } from "@/lib/post-draft-store";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json({
    ok: true,
    ...repairBadDraftTexts(),
  });
}
