import { NextResponse } from "next/server";
import { runCurrencyAudit } from "@/lib/currency-audit";
import { sanitizeCurrencyText } from "@/lib/currency-policy";

export const dynamic = "force-dynamic";

export async function GET() {
  const audit = runCurrencyAudit();

  return NextResponse.json({
    ...audit,
    matches: audit.matches.map((match, index) => ({
      ...match,
      term: `blocked-currency-term-${index + 1}`,
      preview: sanitizeCurrencyText(match.preview),
    })),
    checkedTerms: audit.checkedTerms.map((_, index) => `blocked-currency-term-${index + 1}`),
  });
}
