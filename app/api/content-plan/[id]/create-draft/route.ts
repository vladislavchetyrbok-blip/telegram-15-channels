import { NextResponse } from "next/server";
import { createDraftFromContentPlanItem } from "@/lib/content-plan-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = await createDraftFromContentPlanItem(params.id);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      item: result.item,
      draftId: result.draftId,
      error: result.error,
    },
    { status: result.ok ? 200 : 400 },
  );
}
