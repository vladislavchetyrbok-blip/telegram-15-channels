import { NextResponse } from "next/server";
import { getContentPlanState } from "@/lib/content-plan-store";
import type { ContentPlanStatus } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId") || undefined;
  const status = (searchParams.get("status") || undefined) as ContentPlanStatus | undefined;
  const date = searchParams.get("date") || undefined;

  return NextResponse.json(getContentPlanState({ channelId, status, date }));
}
