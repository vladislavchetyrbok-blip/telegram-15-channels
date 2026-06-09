import { NextResponse } from "next/server";
import { checkLocalAiConnection } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await checkLocalAiConnection();

  return NextResponse.json(result);
}
