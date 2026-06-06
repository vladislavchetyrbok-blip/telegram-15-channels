import { NextResponse } from "next/server";
import { getVisualEngineStatus, checkComfyUiHealth, generateWithVisualProvider } from "@/lib/visuals/image-provider";
import { getVisualEngineConfig, updateVisualEngineRuntimeSettings, type ImageProviderType } from "@/lib/visual-engine-config";
import { getWeeklyContentPlanState } from "@/lib/weekly-content-plan";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getVisualEngineStatus());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: "check_engine" | "check_comfyui" | "generate_template_preview" | "generate_ai_preview" | "reset_local_template";
    postId?: string;
    provider?: ImageProviderType;
    confirmed?: boolean;
  };

  if (body.action === "check_comfyui") {
    const config = getVisualEngineConfig();
    return NextResponse.json({
      ok: true,
      comfyui: await checkComfyUiHealth(config.comfyUiUrl),
      telegramSent: false,
      autopublishEnabledChanged: false,
      targetsChanged: false,
    });
  }

  if (body.action === "reset_local_template") {
    updateVisualEngineRuntimeSettings({
      imageProvider: "local_template",
      fallbackProvider: "local_template",
      imageAiEnabled: false,
      imageGenerationMode: "template_first",
      imageHardwareProfile: "low",
      lastProviderError: null,
    });
    return NextResponse.json(await getVisualEngineStatus());
  }

  if (body.action === "generate_template_preview" || body.action === "generate_ai_preview") {
    const state = getWeeklyContentPlanState();
    const postId = body.postId ?? state.items.find((item) => item.status !== "published" && !item.telegramMessageId)?.postId ?? state.items[0]?.postId;
    if (!postId) {
      return NextResponse.json({ ok: false, error: "No visual item found.", telegramSent: false, autopublishEnabledChanged: false, targetsChanged: false }, { status: 404 });
    }

    const requestedProvider = body.action === "generate_template_preview" ? "local_template" : body.provider;
    const result = await generateWithVisualProvider({ postId, provider: requestedProvider, confirmed: body.confirmed });

    return NextResponse.json({
      ok: true,
      result,
      state: await getVisualEngineStatus(),
      telegramSent: false,
      autopublishEnabledChanged: false,
      targetsChanged: false,
    });
  }

  return NextResponse.json(await getVisualEngineStatus());
}
