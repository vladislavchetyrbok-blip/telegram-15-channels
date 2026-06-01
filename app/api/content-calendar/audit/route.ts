import { NextResponse } from "next/server";
import { auditContentCalendar } from "@/lib/content-calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(auditContentCalendar(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
