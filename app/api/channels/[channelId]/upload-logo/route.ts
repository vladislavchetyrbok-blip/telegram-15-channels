import { NextResponse } from "next/server";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { deleteCustomLogo, getChannelLogoDisplayState, uploadCustomLogo } from "@/lib/custom-logos";

export const dynamic = "force-dynamic";

export function GET(_request: Request, { params }: { params: { channelId: string } }) {
  return NextResponse.json(getChannelLogoDisplayState(params.channelId));
}

export async function POST(request: Request, { params }: { params: { channelId: string } }) {
  const channel = channelGenerationConfigs.find((item) => item.id === params.channelId);

  if (!channel) {
    return NextResponse.json({ ok: false, error: "Канал не найден." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Файл логотипа не найден." }, { status: 400 });
  }

  const result = await uploadCustomLogo(params.channelId, file);

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}

export function DELETE(_request: Request, { params }: { params: { channelId: string } }) {
  return NextResponse.json(deleteCustomLogo(params.channelId));
}
