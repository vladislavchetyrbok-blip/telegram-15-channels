import { NextResponse } from "next/server";
import {
  getScheduledAutopublishStatus,
  runAutopublishSchedulerTick,
  runManualMassAutopublishNow,
  runSingleChannelTestAutopublish,
} from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getScheduledAutopublishStatus();

  return NextResponse.json(
    {
      ok: true,
      mode: "status_only",
      message: "Use POST /api/autopublish/run to execute autopublish. GET never sends Telegram posts.",
      status,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode = typeof body.mode === "string" ? body.mode : "scheduled";

  if (mode === "test") {
    const channelId = typeof body.channelId === "string" ? body.channelId : "";
    return NextResponse.json(await runSingleChannelTestAutopublish(channelId), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  if (mode === "publish_all_now") {
    return NextResponse.json(await runManualMassAutopublishNow(), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  return NextResponse.json(await runAutopublishSchedulerTick(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
