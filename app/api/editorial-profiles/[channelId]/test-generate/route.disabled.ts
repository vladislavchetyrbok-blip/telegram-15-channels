import { NextResponse } from "next/server";
import { getChannelGenerationConfig } from "@/data/channelGeneration";
import { generateTextWithAI } from "@/lib/ai";
import { addEditorialLog, buildEditorialPrompt, loadEditorialProfile, validateGeneratedPost } from "@/lib/editorial";

interface RouteContext {
  params: {
    channelId: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const channel = getChannelGenerationConfig(params.channelId);
  const profile = loadEditorialProfile(params.channelId);

  if (!channel || !profile) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "Channel or editorial profile was not found",
      },
      { status: 404 },
    );
  }

  const aiResult = await generateTextWithAI({
    prompt: buildEditorialPrompt({
      channel,
      topic: channel.topic,
      profile,
    }),
  });

  if (!aiResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        provider: aiResult.provider,
        model: aiResult.model,
        error: aiResult.error,
      },
      { status: 502 },
    );
  }

  addEditorialLog(channel.id, "regeneratedByRules");
  const validation = validateGeneratedPost(aiResult.text, profile);

  return NextResponse.json({
    ok: validation.ok,
    mode: "dry-run",
    telegramSent: false,
    provider: aiResult.provider,
    model: aiResult.model,
    profile,
    text: aiResult.text,
    validation,
  });
}
