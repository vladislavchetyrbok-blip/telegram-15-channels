import { NextResponse } from "next/server";
import { getPublicationScheduleState } from "@/lib/publication-schedule-store";

export async function GET() {
  return NextResponse.json(getPublicationScheduleState());
}
