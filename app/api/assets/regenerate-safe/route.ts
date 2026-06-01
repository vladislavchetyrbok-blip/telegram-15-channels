import { NextResponse } from "next/server";
import { regenerateUnsafeVisualAssets, runVisualAssetAudit } from "@/lib/visual-assets";

export const dynamic = "force-dynamic";

export function POST() {
  const regeneration = regenerateUnsafeVisualAssets();
  const audit = runVisualAssetAudit();

  return NextResponse.json({
    ...regeneration,
    audit,
  });
}
