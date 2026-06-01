import { NextResponse } from "next/server";
import { auditTelegramPostImages } from "@/lib/telegram-post-images";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(auditTelegramPostImages(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST() {
  return NextResponse.json(auditTelegramPostImages({ createMissing: true }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
