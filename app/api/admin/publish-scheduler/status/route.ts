import { NextResponse } from "next/server";
import { getPublishSchedulerStatus } from "@/lib/publish-scheduler-status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPublishSchedulerStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
