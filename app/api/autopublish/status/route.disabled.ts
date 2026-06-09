import { NextResponse } from "next/server";
import { getScheduledAutopublishStatus, updateAutopublishConfig } from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getScheduledAutopublishStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (typeof body.enabled === "boolean") {
    await updateAutopublishConfig(body.enabled ? "enable" : "disable");
  }

  return NextResponse.json(await getScheduledAutopublishStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
