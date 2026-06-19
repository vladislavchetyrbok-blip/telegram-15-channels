import { NextResponse } from "next/server";

import { validateTelegramWebAppInitData } from "@/lib/zodiac-telegram-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const initData = parseTelegramAuthorization(request.headers.get("authorization"));
  const result = validateTelegramWebAppInitData({
    initData,
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: result.status,
        hasUser: false,
      },
      { status: statusCodeForAuthFailure(result.status) },
    );
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    hasUser: true,
    userIdMasked: maskTelegramUserId(result.identity.telegramUserId),
    authDate: result.identity.authDate,
    languageCode: result.identity.languageCode ?? null,
  });
}

function parseTelegramAuthorization(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^tma\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function statusCodeForAuthFailure(status: string): number {
  if (status === "bot_token_missing") {
    return 503;
  }

  if (status === "missing" || status === "malformed") {
    return 400;
  }

  return 401;
}

function maskTelegramUserId(value: string): string {
  if (value.length <= 4) {
    return "***";
  }

  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}
