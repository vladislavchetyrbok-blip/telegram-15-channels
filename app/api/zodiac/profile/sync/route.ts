import { NextResponse } from "next/server";

import {
  resolveZodiacProfileSyncRequest,
  type ZodiacProfileSyncMethod,
} from "@/lib/zodiac-profile-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleProfileSyncRequest(request, "GET");
}

export async function POST(request: Request) {
  return handleProfileSyncRequest(request, "POST");
}

export async function DELETE(request: Request) {
  return handleProfileSyncRequest(request, "DELETE");
}

async function handleProfileSyncRequest(
  request: Request,
  method: ZodiacProfileSyncMethod,
) {
  const result = await resolveZodiacProfileSyncRequest({
    method,
    authorizationHeader: request.headers.get("authorization"),
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    readBody: method === "POST" ? () => readJsonBody(request) : undefined,
  });

  return NextResponse.json(result.body, { status: result.httpStatus });
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
