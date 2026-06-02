import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "publish-due.mjs");
    const result = await execFileAsync(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PUBLISH_DUE_STORE: "json",
        PUBLISH_DUE_DRY_RUN: "true",
        PUBLISH_DUE_SOURCE: "api",
      },
      maxBuffer: 1024 * 1024,
      timeout: 120_000,
      windowsHide: true,
    });

    return NextResponse.json({
      ok: true,
      result: parseJsonOutput(result.stdout),
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const output = typeof error === "object" && error && "stdout" in error ? String(error.stdout ?? "") : "";
    const stderr = typeof error === "object" && error && "stderr" in error ? String(error.stderr ?? "") : "";

    return NextResponse.json(
      {
        ok: false,
        message,
        result: parseJsonOutput(output),
        stdout: output,
        stderr,
      },
      { status: 500 },
    );
  }
}

function parseJsonOutput(output: string) {
  const trimmed = output.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
