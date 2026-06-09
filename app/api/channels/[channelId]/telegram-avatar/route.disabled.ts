import { NextResponse } from "next/server";
import { getTelegramAvatarStatus, setTelegramAvatarStatus } from "@/lib/telegram-avatar-status";
import type { TelegramAvatarStatus } from "@/types";

export const dynamic = "force-dynamic";

export function GET(_request: Request, { params }: { params: { channelId: string } }) {
  return NextResponse.json(getTelegramAvatarStatus(params.channelId));
}

export async function POST(request: Request, { params }: { params: { channelId: string } }) {
  const body = (await request.json().catch(() => ({}))) as { status?: TelegramAvatarStatus };
  const result = setTelegramAvatarStatus(params.channelId, body.status ?? "manual_configured");

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
