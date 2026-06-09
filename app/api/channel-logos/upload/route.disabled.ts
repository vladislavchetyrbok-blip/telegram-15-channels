import { NextResponse } from "next/server";
import { uploadCustomLogo } from "@/lib/custom-logos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "multipart form data is required.",
      },
      { status: 400 },
    );
  }

  const channelId = String(formData.get("channelId") ?? "");
  const file = formData.get("file");

  if (!channelId) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "channelId is required.",
      },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "image file is required.",
      },
      { status: 400 },
    );
  }

  const result = await uploadCustomLogo(channelId, file);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
