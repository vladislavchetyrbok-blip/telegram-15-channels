import { NextResponse } from "next/server";
import { listPostDrafts } from "@/lib/post-draft-store";
import { getEditorialCounters, getEditorialLogs, listEditorialProfiles } from "@/lib/editorial";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = listEditorialProfiles();

  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    telegramSent: false,
    profiles,
    counters: getEditorialCounters(listPostDrafts()),
    logs: getEditorialLogs(),
  });
}
