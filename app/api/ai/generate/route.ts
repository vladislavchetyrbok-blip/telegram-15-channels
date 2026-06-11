import { NextResponse } from "next/server";
import { generatePostWithAI, type AiMode, type ChannelLanguage } from "@/lib/ai";

interface GenerateRequestBody {
  channelName?: string;
  language?: ChannelLanguage;
  topic?: string;
  mode?: AiMode;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;

    if (!body.channelName || !body.topic || !body.language) {
      return NextResponse.json(
        {
          ok: false,
          text: "",
          provider: "lmstudio",
          mode: body.mode ?? "mock",
          error: "channelName, language and topic are required",
        },
        { status: 400 },
      );
    }

    const result = await generatePostWithAI({
      channelName: body.channelName,
      language: body.language,
      topic: body.topic,
      mode: body.mode ?? "mock",
    });

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
        mode: "mock",
        model: "unknown",
        error: "Invalid generation request",
      },
      { status: 400 },
    );
  }
}
