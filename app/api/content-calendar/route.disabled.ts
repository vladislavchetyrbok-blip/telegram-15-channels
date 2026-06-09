import { NextResponse } from "next/server";
import { getContentCalendarState } from "@/lib/content-calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getContentCalendarState(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
