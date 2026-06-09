import { NextResponse } from "next/server";
import { rejectContentPlanItem } from "@/lib/content-plan-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = rejectContentPlanItem(params.id);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      telegramSent: false,
      item: result.item,
      error: result.error,
    },
    { status: result.ok ? 200 : 404 },
  );
}
