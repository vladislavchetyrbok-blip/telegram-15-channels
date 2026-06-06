import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { getVisualProviderStatus } = await import("../../../../../scripts/lib/visual-provider-system.mjs");
  return NextResponse.json(await getVisualProviderStatus());
}
