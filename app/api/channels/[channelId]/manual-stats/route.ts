import { NextResponse } from "next/server";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { saveManualChannelStats } from "@/lib/channel-stats";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { channelId: string } }) {
  const channel = channelGenerationConfigs.find((item) => item.id === params.channelId);

  if (!channel) {
    return NextResponse.json({ ok: false, error: "Channel was not found." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    subscribers?: number | string | null;
    averageViews?: number | string | null;
    engagementRate?: number | string | null;
    lastUpdated?: string | null;
  };
  const stats = saveManualChannelStats({
    channelId: params.channelId,
    subscribers: parseOptionalNumber(body.subscribers),
    averageViews: parseOptionalNumber(body.averageViews),
    engagementRate: parseOptionalNumber(body.engagementRate),
    lastUpdated: body.lastUpdated,
  });

  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    telegramSent: false,
    stats,
  });
}

function parseOptionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}
