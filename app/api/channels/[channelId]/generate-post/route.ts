import { NextResponse } from "next/server";
import { generatePostForChannel } from "@/lib/channel-post-generation";

interface RouteContext {
  params: {
    channelId: string;
  };
}

export async function POST(_request: Request, context: RouteContext) {
  const result = await generatePostForChannel(context.params.channelId);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
