import { NextResponse } from "next/server";
import {
  checkTomorrowSchedule,
  getAutopublishStatus,
  prepareTomorrowContent,
  runAutopublishSchedulerTick,
  runAutopublishToday,
  runNextScheduledPublicationNow,
  runWeeklyContentPlanAction,
  runWeeklyContentPlanRowAction,
  updateAutopublishConfig,
} from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getAutopublishStatus());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "status";

  if (action === "enable" || action === "disable" || action === "pause_today" || action === "resume_today" || action === "emergency_stop") {
    return NextResponse.json(await updateAutopublishConfig(action));
  }

  if (action === "update") {
    return NextResponse.json(await updateAutopublishConfig("update", body.config ?? {}));
  }

  if (action === "prepare_tomorrow") {
    return NextResponse.json(await prepareTomorrowContent());
  }

  if (action === "check_schedule") {
    return NextResponse.json(await checkTomorrowSchedule());
  }

  if (action === "scheduler_tick") {
    return NextResponse.json(await runAutopublishSchedulerTick());
  }

  if (action === "run_today") {
    return NextResponse.json(await runAutopublishToday({ confirmed: body.confirmed === true }), {
      status: body.confirmed === true ? 200 : 409,
    });
  }

  if (action === "run_next_due_now") {
    return NextResponse.json(await runNextScheduledPublicationNow({ confirmed: body.confirmed === true }), {
      status: body.confirmed === true ? 200 : 409,
    });
  }

  if (action === "retry_today_errors") {
    return NextResponse.json(await runAutopublishToday({ confirmed: body.confirmed === true, mode: "retry_failed" }), {
      status: body.confirmed === true ? 200 : 409,
    });
  }

  if (
    action === "generate_weekly_plan" ||
    action === "check_weekly_plan" ||
    action === "improve_weak_weekly" ||
    action === "repair_captions" ||
    action === "schedule_weekly_ready" ||
    action === "clear_blocked_weekly"
  ) {
    return NextResponse.json(runWeeklyContentPlanAction(action, body.confirmed === true), {
      status: action === "clear_blocked_weekly" && body.confirmed !== true ? 409 : 200,
    });
  }

  if (
    action === "weekly_item_open" ||
    action === "weekly_item_regenerate_text" ||
    action === "weekly_item_regenerate_image" ||
    action === "weekly_item_mark_ready" ||
    action === "weekly_item_block" ||
    action === "weekly_item_delete"
  ) {
    const itemId = typeof body.itemId === "string" ? body.itemId : "";
    const rowAction = action.replace("weekly_item_", "") as Parameters<typeof runWeeklyContentPlanRowAction>[1];
    return NextResponse.json(runWeeklyContentPlanRowAction(itemId, rowAction));
  }

  return NextResponse.json(await getAutopublishStatus());
}
