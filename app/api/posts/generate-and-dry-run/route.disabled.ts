import { NextResponse } from "next/server";
import { getChannelGenerationConfig } from "@/data/channelGeneration";
import { generateTextWithAI } from "@/lib/ai";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { buildEditorialPrompt, loadEditorialProfile, validateGeneratedPost } from "@/lib/editorial";
import { createPostDraftFromGeneratedText } from "@/lib/post-draft-store";
import { addTelegramDryRunGenerationEvent } from "@/lib/telegram-dry-run-events";
import { getTelegramConfig } from "@/lib/telegram";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";

interface GenerateAndDryRunBody {
  channelId?: string;
  topic?: string;
  language?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateAndDryRunBody;

  if (!body.channelId) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        dryRunMessage: "channelId is required",
      },
      { status: 400 },
    );
  }

  const channel = getChannelGenerationConfig(body.channelId);

  if (!channel) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        dryRunMessage: "Channel was not found",
      },
      { status: 404 },
    );
  }

  const telegramConfig = getTelegramConfig();
  const topic = body.topic?.trim() || channel.topic;
  const language = body.language?.trim() || channel.language;

  if (!telegramConfig.dryRun) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        channelTitle: channel.name,
        telegramChatId: channel.telegramChatId,
        generatedText: "",
        dryRunMessage: "TELEGRAM_DRY_RUN is disabled. Real Telegram sending is blocked by this endpoint.",
      },
      { status: 409 },
    );
  }

  const aiResult = await generateTextWithAI({
    prompt: buildEditorialPrompt({
      channel,
      topic,
      profile: loadEditorialProfile(channel.id),
    }),
  });

  if (!aiResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        channelTitle: channel.name,
        telegramChatId: channel.telegramChatId,
        generatedText: "",
        dryRunMessage: "LM Studio generation failed. Telegram was not touched.",
        error: aiResult.error,
      },
      { status: 502 },
    );
  }

  const profile = loadEditorialProfile(channel.id);
  const validation = profile ? validateGeneratedPost(aiResult.text, profile) : undefined;
  const currencyValidation = validateCurrencyPolicy(aiResult.text);
  const draft = createPostDraftFromGeneratedText({
    channel,
    content: aiResult.text,
    topic,
    modelName: aiResult.model,
  });

  if (!currencyValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        channelTitle: channel.name,
        telegramChatId: channel.telegramChatId,
        generatedText: aiResult.text,
        draftId: draft.id,
        imageUrl: draft.imageUrl,
        imageCaption: draft.imageCaption,
        validation,
        currency: currencyValidation,
        dryRunMessage: "Forbidden currency detected",
      },
      { status: 422 },
    );
  }

  const safety = validateTelegramSendSafety({
    channelId: channel.id,
    telegramChatId: channel.telegramChatId,
    draftId: draft.id,
    draftStatus: draft.status,
  });
  const event = {
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    generatedAt: new Date().toISOString(),
    aiProvider: "lmstudio" as const,
    telegramSent: false as const,
    mode: "dry-run" as const,
  };

  addTelegramDryRunGenerationEvent(event);

  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    aiProvider: "lmstudio",
    telegramSent: false,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    generatedText: aiResult.text,
    draftId: draft.id,
    imageUrl: draft.imageUrl,
    imageCaption: draft.imageCaption,
    readinessStatus: draft.readinessStatus,
    validation,
    safety,
    dryRunEvent: event,
    dryRunMessage: "Dry-run: сообщение не отправлено",
  });
}

function buildGenerateAndDryRunPrompt({
  channelTitle,
  topic,
  language,
  postStyle,
  postingFrequency,
}: {
  channelTitle: string;
  topic: string;
  language: string;
  postStyle: string;
  postingFrequency: string;
}) {
  return [
    "Сгенерируй Telegram-пост для безопасного dry-run сценария.",
    `Канал: ${channelTitle}`,
    `Тема: ${topic}`,
    `Язык: ${language}`,
    `Стиль: ${postStyle}`,
    `Частота публикаций канала: ${postingFrequency}`,
    "Формат: короткий заголовок и основной текст 700-1200 знаков.",
    "Не пиши, что сообщение уже опубликовано. Это только dry-run предпросмотр.",
  ].join("\n");
}
