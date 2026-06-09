import { NextResponse } from "next/server";
import { getTestPublishSandboxStatus, runTestPublishSandbox } from "@/lib/test-publish-sandbox";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getTestPublishSandboxStatus());
}

export async function POST() {
  const result = await runTestPublishSandbox();

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
