import { NextResponse } from "next/server";
import { getContentCalendarPreview } from "@/lib/content-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";

  return NextResponse.json(getContentCalendarPreview(id), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
