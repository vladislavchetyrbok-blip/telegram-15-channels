import { NextResponse } from "next/server";
import { channels } from "@/data/channels";
import { getCanonicalChannelTitle } from "@/lib/channel-canonical";
import {
  getWeeklyContentPlanState,
  isWeeklyPlanItemReadyToPublish,
  runWeeklyContentPlanItemAction,
  type WeeklyContentPlanItem,
} from "@/lib/weekly-content-plan";
import { findGenericContentIssues, hasServiceVisualLabel } from "@/lib/channel-content-strategy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channelId = url.searchParams.get("channelId") ?? "";

  return NextResponse.json(buildPreview(channelId), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const channelId = typeof body.channelId === "string" ? body.channelId : "";
  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  const action = body.action === "regenerate_image" ? "regenerate_image" : body.action === "regenerate_text" ? "regenerate_text" : null;

  if (!action || !itemId) {
    return NextResponse.json({ ok: false, message: "Missing preview action or itemId.", preview: buildPreview(channelId).preview }, { status: 400 });
  }

  runWeeklyContentPlanItemAction({ itemId, action });

  return NextResponse.json(buildPreview(channelId, itemId), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function buildPreview(channelId: string, preferredItemId?: string) {
  const state = getWeeklyContentPlanState();
  const channel = channels.find((item) => item.id === channelId) ?? channels[0];
  const item = (preferredItemId ? state.items.find((candidate) => candidate.id === preferredItemId) : null) ?? findPreviewItem(state.items, channel.id);

  return {
    ok: Boolean(item),
    channel: {
      channelId: channel.id,
      channelName: getCanonicalChannelTitle(channel.id, channel.name),
    },
    preview: item
      ? (() => {
          const previewIssues = Array.from(
            new Set([
              ...item.qualityIssues,
              ...findGenericContentIssues({ channelId: item.channelId, title: item.title, body: item.body, topic: item.contentTopic }),
              ...(hasServiceVisualLabel(`${item.title}\n${item.contentTopic}\n${JSON.stringify(item.visualMetadata ?? {})}`)
                ? ["service_visual_label_detected"]
                : []),
            ]),
          );

          return {
          id: item.id,
          postId: item.postId,
          channelId: item.channelId,
          channelName: getCanonicalChannelTitle(item.channelId, item.channelName),
          contentPlanDate: item.contentPlanDate,
          scheduledAt: item.scheduledAt,
          contentTopic: item.contentTopic,
          title: item.title,
          body: item.body,
          telegramCaption: item.telegramCaption,
          imageUrl: item.imageUrl,
          telegramImagePath: item.telegramImagePath,
          status: item.status,
          textQuality: item.textQuality,
          imageQuality: item.imageQuality,
          telegramImageStatus: item.telegramImageStatus,
          qualityIssues: previewIssues,
          readyToPublish: isWeeklyPlanItemReadyToPublish(item) && previewIssues.length === 0,
        };
        })()
      : null,
    message: item ? "Preview loaded. Telegram was not touched." : "No preview item found for channel.",
  };
}

function findPreviewItem(items: WeeklyContentPlanItem[], channelId: string) {
  const candidates = items
    .filter((item) => item.channelId === channelId && item.status !== "published" && !item.telegramMessageId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const todayKey = new Date().toISOString().slice(0, 10);
  const currentOrFuture = candidates.filter((item) => item.contentPlanDate >= todayKey);

  return (
    currentOrFuture.find((item) => isWeeklyPlanItemReadyToPublish(item)) ??
    currentOrFuture[0] ??
    candidates.find((item) => isWeeklyPlanItemReadyToPublish(item)) ??
    candidates[0] ??
    null
  );
}
