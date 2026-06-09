import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  let payload: { postId?: unknown; confirm?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, sent: false, message: "Invalid JSON body. No post was sent." }, { status: 400 });
  }

  const postId = typeof payload.postId === "string" ? payload.postId.trim() : "";
  const confirm = payload.confirm === true;

  if (!postId) {
    return NextResponse.json({ ok: false, sent: false, message: "Missing postId. No post was sent." }, { status: 400 });
  }

  if (!confirm) {
    return NextResponse.json({ ok: false, sent: false, message: "confirm must be true. No post was sent." }, { status: 400 });
  }

  // @ts-ignore - Shared Node utility is authored as ESM for CLI reuse.
  const { sendManualOnePostTest } = await import("../../../../../scripts/lib/manual-one-post-test-send.mjs");
  const result = await sendManualOnePostTest({ postId, confirm });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
