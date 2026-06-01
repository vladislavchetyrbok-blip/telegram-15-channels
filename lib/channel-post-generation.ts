import {
  getChannelGenerationConfig,
  type ChannelGenerationConfig,
} from "@/data/channelGeneration";
import { generateTextWithAI } from "@/lib/ai";
import { buildEditorialPrompt, loadEditorialProfile, validateGeneratedPost } from "@/lib/editorial";
import { validateTelegramSettings } from "@/lib/telegram";

export interface GeneratePostForChannelResult {
  ok: boolean;
  channel?: ChannelGenerationConfig;
  text: string;
  dryRun: boolean;
  sent: false;
  provider: string;
  model?: string;
  message: string;
  error?: string;
  validationReasons?: string[];
}

export async function generatePostForChannel(
  channelId: string,
): Promise<GeneratePostForChannelResult> {
  const channel = getChannelGenerationConfig(channelId);
  const telegram = validateTelegramSettings();

  if (!channel) {
    return {
      ok: false,
      text: "",
      dryRun: telegram.config.dryRun,
      sent: false,
      provider: "lmstudio",
      message: "Channel config not found",
      error: `Unknown channelId: ${channelId}`,
    };
  }

  if (!telegram.config.dryRun) {
    return {
      ok: false,
      channel,
      text: "",
      dryRun: false,
      sent: false,
      provider: "lmstudio",
      message: "Real Telegram publishing is blocked by this safe endpoint.",
      error: "TELEGRAM_DRY_RUN must be true for channel generation preview.",
    };
  }

  const aiResult = await generateTextWithAI({
    prompt: buildChannelPrompt(channel),
  });
  const profile = loadEditorialProfile(channel.id);
  const validation = aiResult.ok && profile ? validateGeneratedPost(aiResult.text, profile) : undefined;

  return {
    ok: aiResult.ok && (validation?.ok ?? true),
    channel,
    text: aiResult.text,
    dryRun: true,
    sent: false,
    provider: aiResult.provider,
    model: aiResult.model,
    message: aiResult.ok
      ? validation?.ok === false
        ? "Post generated but needs editorial revision. Telegram was not touched."
        : "Post generated. Dry-run: message was not sent."
      : "Post generation failed. Telegram was not touched.",
    error: aiResult.error,
    validationReasons: validation?.reasons,
  };
}

function buildChannelPrompt(channel: ChannelGenerationConfig) {
  return buildEditorialPrompt({
    channel,
    topic: channel.topic,
    profile: loadEditorialProfile(channel.id),
  });
/*
  const languageInstruction =
    channel.language === "uk"
      ? "Пиши українською мовою."
      : channel.language === "ru"
        ? "Пиши на русском языке."
        : "Пиши уместно на русском и украинском, без смешивания в одном предложении.";

  return [
    "Сгенерируй тестовый Telegram-пост для канала.",
    `Название канала: ${channel.name}`,
    `Тематика: ${channel.topic}`,
    `Стиль: ${channel.postStyle}`,
    `Частота публикаций: ${channel.postingFrequency}`,
    `Статус канала: ${channel.status}`,
    languageInstruction,
    "Требования: 600-1000 знаков, без отправки в Telegram, без обещаний результата, с практичным выводом.",
    "В конце добавь строку: dry-run: сообщение не отправлено.",
  ].join("\n");
*/
}
