import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { assertSafeManualDryRunOnly } from "@/lib/production-safety";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

export async function POST() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, manualAction: true, dryRun: true, realTelegramPublishAllowed: false, message: "Admin access denied." }, { status: 401 });
  }

  const safety = assertSafeManualDryRunOnly();

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "publish-due.mjs");
    const result = await execFileAsync(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PUBLISH_DUE_STORE: "json",
        PUBLISH_DUE_DRY_RUN: "true",
        PUBLISH_DUE_SOURCE: "api",
        TELEGRAM_DRY_RUN: "true",
        TELEGRAM_REAL_PUBLISH_ENABLED: "false",
        TELEGRAM_BOT_TOKEN: "",
      },
      maxBuffer: 1024 * 1024,
      timeout: 120_000,
      windowsHide: true,
    });

    const parsed = parseJsonOutput(result.stdout);

    return NextResponse.json({
      ok: true,
      manualAction: true,
      dryRun: true,
      realTelegramPublishAllowed: false,
      checked: Number(parsed?.checked ?? 0),
      published: Number(parsed?.published ?? 0),
      skipped: Number(parsed?.skipped ?? 0),
      errors: Number(parsed?.errors ?? 0),
      message: parsed?.message ?? "Dry-run completed.",
      safety,
      result: parsed,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const output = typeof error === "object" && error && "stdout" in error ? String(error.stdout ?? "") : "";
    const stderr = typeof error === "object" && error && "stderr" in error ? String(error.stderr ?? "") : "";

    const parsed = parseJsonOutput(output);

    return NextResponse.json(
      {
        ok: false,
        manualAction: true,
        dryRun: true,
        realTelegramPublishAllowed: false,
        checked: Number(parsed?.checked ?? 0),
        published: Number(parsed?.published ?? 0),
        skipped: Number(parsed?.skipped ?? 0),
        errors: Number(parsed?.errors ?? 0),
        message,
        safety,
        result: parsed,
        stdout: output,
        stderr,
      },
      { status: 500 },
    );
  }
}

function parseJsonOutput(output: string): { checked?: number; published?: number; skipped?: number; errors?: number; message?: string; [key: string]: unknown } | null {
  const trimmed = output.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
