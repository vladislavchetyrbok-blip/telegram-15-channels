import { NextResponse } from "next/server";
import { mockEmergencyStop } from "@/lib/telegram-safety";

export async function POST() {
  return NextResponse.json(mockEmergencyStop());
}
