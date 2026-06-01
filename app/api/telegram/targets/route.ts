import { NextResponse } from "next/server";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      channelsTotal: 15,
      linked: listTelegramTargetBindings().filter((item) => item.telegramTarget).length,
      targets: listTelegramTargetBindings(),
      realPublishEnabled: false,
      allowRealPublish: false,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
