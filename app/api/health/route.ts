import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "telegram-15-channels",
    time: new Date().toISOString(),
    environment: process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  });
}
