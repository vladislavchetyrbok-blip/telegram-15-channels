import { NextResponse } from "next/server";
import { loadEditorialProfile } from "@/lib/editorial";

interface RouteContext {
  params: {
    channelId: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const profile = loadEditorialProfile(params.channelId);

  return NextResponse.json(
    {
      ok: Boolean(profile),
      mode: "dry-run",
      telegramSent: false,
      profile,
      error: profile ? undefined : "Editorial profile was not found",
    },
    { status: profile ? 200 : 404 },
  );
}
