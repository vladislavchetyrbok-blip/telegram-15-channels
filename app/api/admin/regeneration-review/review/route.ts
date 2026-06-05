import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const reviewActions = new Set(["approve", "reject", "needs_changes"]);

export async function POST(request: Request) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  let payload: { draftId?: unknown; action?: unknown; note?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body. No regeneration drafts were changed." }, { status: 400 });
  }

  const draftId = typeof payload.draftId === "string" ? payload.draftId.trim() : "";
  const action = typeof payload.action === "string" ? payload.action.trim() : "";
  const note = typeof payload.note === "string" ? payload.note : undefined;

  if (!draftId) {
    return NextResponse.json({ ok: false, message: "Missing draftId. No regeneration drafts were changed." }, { status: 400 });
  }

  if (!reviewActions.has(action)) {
    return NextResponse.json({ ok: false, message: "Invalid action. Use approve, reject, or needs_changes. No regeneration drafts were changed." }, { status: 400 });
  }

  // @ts-ignore - Shared Node utility is authored as ESM for CLI reuse.
  const { reviewRegenerationDraft } = await import("../../../../../scripts/lib/regeneration-drafts.mjs");
  const result = await reviewRegenerationDraft({ draftId, action, note });

  return NextResponse.json(
    result,
    {
      status: result.ok ? 200 : 400,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
