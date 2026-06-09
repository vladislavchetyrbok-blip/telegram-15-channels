import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { getVisualRegenerationImageCandidateStatus } = await import("../../../../../../scripts/lib/visual-regeneration-images.mjs");
  return NextResponse.json(await getVisualRegenerationImageCandidateStatus());
}
