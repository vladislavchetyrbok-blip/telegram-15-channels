import { NextResponse } from "next/server";
import { getTestPublishBatchSandboxStatus, runTestPublishBatchSandbox } from "@/lib/test-publish-sandbox";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getTestPublishBatchSandboxStatus());
}

export async function POST() {
  const result = await runTestPublishBatchSandbox();

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
