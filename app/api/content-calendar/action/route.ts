import { NextResponse } from "next/server";
import { runContentCalendarItemNow, runWeeklyContentPlanRowAction } from "@/lib/autopublish";

export const dynamic = "force-dynamic";

const safeActions = new Set(["regenerate_text", "regenerate_image", "regenerate_full", "mark_ready", "skip"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";

  if (!id || !action) {
    return NextResponse.json({ ok: false, message: "Missing content calendar id or action." }, { status: 400 });
  }

  if (action === "publish_now") {
    const result = await runContentCalendarItemNow({ itemId: id, confirmed: body.confirmed === true });
    return NextResponse.json(result, { status: body.confirmed === true ? 200 : 409 });
  }

  if (!safeActions.has(action)) {
    return NextResponse.json({ ok: false, message: "Unknown content calendar action." }, { status: 400 });
  }

  return NextResponse.json(runWeeklyContentPlanRowAction(id, action as Parameters<typeof runWeeklyContentPlanRowAction>[1]));
}
