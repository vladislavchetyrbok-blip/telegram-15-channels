import { NextResponse } from "next/server";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getTelegramConfig } from "@/lib/telegram";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";

interface DryRunSendBody {
  channelId?: string;
  telegramChatId?: string;
  text?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DryRunSendBody;
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        message: "text is required",
      },
      { status: 400 },
    );
  }

  const currencyValidation = validateCurrencyPolicy(text);

  if (!currencyValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        message: "Forbidden currency detected",
        currency: currencyValidation,
      },
      { status: 422 },
    );
  }

  const channel = channelGenerationConfigs.find((item) =>
    body.channelId ? item.id === body.channelId : item.telegramChatId === body.telegramChatId,
  );

  if (!channel) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        message: "Channel was not found",
      },
      { status: 404 },
    );
  }

  const telegram = getTelegramConfig();
  const safety = validateTelegramSendSafety({
    channelId: channel.id,
    telegramChatId: channel.telegramChatId,
  });

  if (!telegram.dryRun) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        channelTitle: channel.name,
        telegramChatId: channel.telegramChatId,
        textPreview: createTextPreview(text),
        safety,
        message: safety.reasons.join(" ") || "Dry-run is disabled. Real Telegram sending is blocked by this safe endpoint.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    telegramSent: false,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    textPreview: createTextPreview(text),
    safety,
    message: "Dry-run: сообщение не отправлено",
  });
}

function createTextPreview(text: string) {
  return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}
