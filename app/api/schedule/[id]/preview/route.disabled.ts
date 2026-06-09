import { NextResponse } from "next/server";
import { previewPublicationSchedule } from "@/lib/publication-schedule-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = previewPublicationSchedule(params.id);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      item: result.item,
      preview: result.item?.contentPreview,
      error: result.error,
    },
    { status: result.ok ? 200 : 404 },
  );
}
