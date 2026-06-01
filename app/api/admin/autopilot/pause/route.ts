import { NextResponse } from "next/server";
import { setAutopilotPause } from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(await setAutopilotPause(true, "admin_endpoint_pause"));
}
