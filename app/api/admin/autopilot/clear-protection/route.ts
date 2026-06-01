import { NextResponse } from "next/server";
import { clearAutopilotProtectionMode } from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(await clearAutopilotProtectionMode());
}
