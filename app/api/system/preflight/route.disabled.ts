import { NextResponse } from "next/server";
import { runSystemPreflight } from "@/lib/system-preflight";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await runSystemPreflight());
}
