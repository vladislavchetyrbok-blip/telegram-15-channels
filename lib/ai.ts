import { getCurrencyPromptRule, validateCurrencyPolicy } from "@/lib/currency-policy";

export type AiMode = "mock" | "local";
export type ChannelLanguage = "RU" | "UA" | "RU-UA";

export interface AiProviderConfig {
  provider: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  modelsUrl: string;
  chatCompletionsUrl: string;
}

export interface GeneratePostWithAIInput {
  channelName: string;
  topic: string;
  language: ChannelLanguage;
  mode?: AiMode;
}

export interface GeneratePostWithAIResult {
  ok: boolean;
  mode: AiMode;
  provider: string;
  model: string;
  text: string;
  error?: string;
}

export interface GenerateTextWithAIInput {
  prompt: string;
  timeoutMs?: number;
  maxTokens?: number;
}

export interface GenerateTextWithAIResult {
  ok: boolean;
  mode: "local";
  provider: string;
  model: string;
  text: string;
  error?: string;
}

export interface LocalAiConnectionResult {
  ok: boolean;
  mode: "local";
  provider: string;
  message: string;
  models?: string[];
}

interface LmStudioModelsResponse {
  data?: Array<{
    id?: string;
    object?: string;
  }>;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
    text?: string;
  }>;
  error?: {
    message?: string;
  };
}

export function getAiProviderConfig(): AiProviderConfig {
  const baseUrl = process.env.LOCAL_AI_BASE_URL ?? "http://localhost:1234/v1";
  const model = process.env.LOCAL_AI_MODEL ?? "local-model";
  const temperature = Number(process.env.LOCAL_AI_TEMPERATURE ?? "0.7");
  const maxTokens = Number(process.env.LOCAL_AI_MAX_TOKENS ?? "800");

  return {
    provider: process.env.LOCAL_AI_PROVIDER ?? "lmstudio",
    baseUrl,
    model,
    temperature,
    maxTokens,
    modelsUrl: `${baseUrl}/models`,
    chatCompletionsUrl: `${baseUrl}/chat/completions`,
  };
}

export async function checkLocalAiConnection(): Promise<LocalAiConnectionResult> {
  const config = getAiProviderConfig();

  try {
    const response = await fetchWithTimeout(config.modelsUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        mode: "local",
        provider: config.provider,
        message: "LM Studio server is not available",
      };
    }

    const payload = (await response.json()) as LmStudioModelsResponse;
    const models = payload.data?.map((model) => model.id).filter(Boolean) as string[] | undefined;

    return {
      ok: true,
      mode: "local",
      provider: config.provider,
      message: "LM Studio connected",
      models: models ?? [],
    };
  } catch {
    return {
      ok: false,
      mode: "local",
      provider: config.provider,
      message: "LM Studio server is not available",
    };
  }
}

export async function generatePostWithAI(
  input: GeneratePostWithAIInput,
): Promise<GeneratePostWithAIResult> {
  const config = getAiProviderConfig();
  const mode = input.mode ?? "mock";

  if (mode === "mock") {
    return {
      ok: true,
      mode,
      provider: config.provider,
      model: config.model,
      text: [
        `Mock AI draft for ${input.channelName}`,
        "",
        `Topic: ${input.topic}`,
        `Language: ${input.language}`,
        "",
        "Короткий Telegram-пост в mock-режиме: цепляющий заход, полезная мысль, конкретный вывод и мягкий call-to-action для аудитории канала.",
      ].join("\n"),
    };
  }

  return generateChatCompletion({
    prompt: buildUserPrompt(input),
    systemPrompt: "Ты помощник для генерации Telegram-постов.",
  }).then((result) => ({
    ok: result.ok,
    mode,
    provider: result.provider,
    model: result.model,
    text: result.text,
    error: result.error,
  }));
}

export async function generateTextWithAI(
  input: GenerateTextWithAIInput,
): Promise<GenerateTextWithAIResult> {
  return generateChatCompletion({
    prompt: input.prompt,
    timeoutMs: input.timeoutMs,
    maxTokens: input.maxTokens,
    systemPrompt: "Ты помощник для генерации коротких Telegram-постов.",
  });
}

async function generateChatCompletion({
  prompt,
  systemPrompt,
  timeoutMs,
  maxTokens,
}: {
  prompt: string;
  systemPrompt: string;
  timeoutMs?: number;
  maxTokens?: number;
}): Promise<GenerateTextWithAIResult> {
  const config = getAiProviderConfig();

  try {
    const model = await resolveLocalModel(config);
    const response = await fetchWithTimeout(config.chatCompletionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: [systemPrompt, getCurrencyPromptRule()].join("\n"),
          },
          {
            role: "user",
            content: [prompt, getCurrencyPromptRule()].join("\n"),
          },
        ],
        temperature: config.temperature,
        max_tokens: maxTokens ?? config.maxTokens,
      }),
    }, timeoutMs ?? 240000);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");

      return {
        ok: false,
        mode: "local",
        provider: config.provider,
        model,
        text: "",
        error:
          errorText ||
          "LM Studio не запущен. Откройте LM Studio → Local Server → Start Server.",
      };
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const text = payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.text ?? "";
    const currencyValidation = validateCurrencyPolicy(text);

    if (text.trim() && !currencyValidation.ok) {
      return {
        ok: false,
        mode: "local",
        provider: config.provider,
        model,
        text,
        error: "Forbidden currency detected",
      };
    }

    return {
      ok: Boolean(text.trim()),
      mode: "local",
      provider: config.provider,
      model,
      text,
      error: text.trim() ? undefined : payload.error?.message ?? "LM Studio вернул пустой ответ.",
    };
  } catch {
    return {
      ok: false,
      mode: "local",
      provider: config.provider,
      model: config.model,
      text: "",
      error: "LM Studio не запущен. Откройте LM Studio → Local Server → Start Server.",
    };
  }
}

async function resolveLocalModel(config: AiProviderConfig) {
  const response = await fetchWithTimeout(config.modelsUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return config.model;
  }

  const payload = (await response.json()) as LmStudioModelsResponse;
  const models = payload.data?.map((model) => model.id).filter(Boolean) as string[] | undefined;

  if (!models?.length || models.includes(config.model)) {
    return config.model;
  }

  return models[0];
}

function buildUserPrompt(input: GeneratePostWithAIInput) {
  return [
    "Сгенерируй пост на выбранную тему.",
    `Канал: ${input.channelName}`,
    `Язык: ${input.language}`,
    `Тема: ${input.topic}`,
    "Формат: Telegram-пост, 700-1200 знаков, без markdown-таблиц, с понятным заголовком и практичным выводом.",
  ].join("\n");
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
