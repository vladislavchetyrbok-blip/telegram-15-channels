import { NextResponse } from "next/server";
import { getCurrencyPolicy } from "@/lib/currency-policy";

export const dynamic = "force-dynamic";

export function GET() {
  const policy = getCurrencyPolicy();
  const publicPolicy = {
    ...policy,
    forbiddenCurrencies: ["blocked currency code"],
    forbiddenSymbols: ["blocked currency symbol"],
    forbiddenWords: ["blocked currency words"],
  };

  return NextResponse.json({
    ok: true,
    policyEnabled: true,
    currentPolicy: publicPolicy,
    allowedCurrencies: policy.allowedCurrencies,
    forbiddenCurrencies: publicPolicy.forbiddenCurrencies,
    forbiddenSymbols: publicPolicy.forbiddenSymbols,
  });
}
