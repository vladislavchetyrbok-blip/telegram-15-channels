import { NextResponse } from "next/server";
import { getVisualAssetPolicy } from "@/lib/visual-assets";

export const dynamic = "force-dynamic";

export function GET() {
  const policy = getVisualAssetPolicy();

  return NextResponse.json({
    ok: true,
    policyEnabled: true,
    allowedSymbols: policy.allowedCurrencySymbols,
    forbiddenSymbols: ["blocked currency symbol"],
    allowedCurrencyCodes: policy.allowedCurrencyCodes,
    forbiddenCurrencyCodes: ["blocked currency code"],
    forbiddenVisualThemes: policy.forbiddenVisualThemes,
    recommendedVisuals: policy.recommendedFinanceVisuals,
  });
}
