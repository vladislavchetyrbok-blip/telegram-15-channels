import { NextResponse } from "next/server";
import { generateTextWithAI } from "@/lib/ai";

const defaultPrompt = "Напиши короткий тестовый пост для Telegram-канала о запуске проекта.";

interface GenerateTestRequestBody {
  prompt?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as GenerateTestRequestBody;
    const prompt = body.prompt?.trim() || defaultPrompt;
    const result = await generateTextWithAI({ prompt });

    return NextResponse.json({
      ok: result.ok,
      text: result.text,
      provider: result.provider,
      mode: result.mode,
      model: result.model,
      error: result.error,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        text: "",
        provider: "lmstudio",
        mode: "local",
        model: "local-model",
        error: "AI test generation request failed",
      },
      { status: 400 },
    );
  }
}
