import { NextResponse } from "next/server";
import { getPublicationScheduleState } from "@/lib/publication-schedule-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPublicationScheduleState());
}
