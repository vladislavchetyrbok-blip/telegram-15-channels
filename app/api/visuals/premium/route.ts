import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { getProviderSafety, getVisualEngineConfig } from "@/lib/visual-engine-config";

const execFileAsync = promisify(execFile);
const planPath = path.join(process.cwd(), "data", "runtime", "weekly-content-plan.json");
const reportPath = path.join(process.cwd(), "data", "runtime", "premium-visual-report.json");
const scriptPath = path.join(process.cwd(), "scripts", "generate-premium-visuals.ps1");

export async function GET() {
  return NextResponse.json(readState());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { postId?: string; all?: boolean; auditOnly?: boolean; confirmedHeavyProvider?: boolean };
  const config = getVisualEngineConfig();
  const requestedCount = body.all ? readState().summary.total : 1;
  const safety = getProviderSafety({
    provider: config.imageProvider,
    hardwareProfile: config.imageHardwareProfile,
    requestedCount,
    confirmed: body.confirmedHeavyProvider,
  });

  if (!safety.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: safety.reason,
        provider: config.imageProvider,
        fallbackProvider: config.fallbackProvider,
        telegramSent: false,
        autopublishEnabledChanged: false,
        targetsChanged: false,
      },
      { status: 409 },
    );
  }

  const args = ["-ExecutionPolicy", "Bypass", "-File", scriptPath];

  if (body.postId) args.push("-PostId", body.postId);
  if (body.all) args.push("-All", "-IncludePublished");
  if (body.auditOnly) args.push("-AuditOnly");

  const { stdout, stderr } = await execFileAsync("powershell", args, {
    cwd: process.cwd(),
    timeout: 10 * 60 * 1000,
    windowsHide: true,
  });
  const parsed = parseJson(stdout);

  return NextResponse.json({
    ok: Boolean(parsed?.ok),
    report: parsed,
    stderr: stderr.trim() || null,
    state: readState(),
    telegramSent: false,
    autopublishEnabledChanged: false,
    targetsChanged: false,
  });
}

function readState() {
  const plan = existsSync(planPath) ? JSON.parse(readFileSync(planPath, "utf8")) : { items: [] };
  const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, "utf8")) : null;
  const items = Array.isArray(plan.items)
    ? plan.items.map((item: any) => ({
        id: item.id,
        postId: item.postId,
        channelId: item.channelId,
        channelName: item.channelName,
        contentPlanDate: item.contentPlanDate,
        contentTopic: item.contentTopic,
        title: item.title,
        imageUrl: item.imageUrl,
        telegramImagePath: item.telegramImagePath,
        telegramImageStatus: item.telegramImageStatus,
        imageQuality: item.imageQuality,
        imageDimensions: item.imageDimensions ?? null,
        visualStyle: item.visualStyle ?? null,
        visualPreset: item.visualPreset ?? null,
        visualVersion: item.visualVersion ?? null,
        visualGeneratedAt: item.visualGeneratedAt ?? null,
        provider: item.provider ?? null,
        fallbackProvider: item.fallbackProvider ?? null,
        fallbackUsed: item.fallbackUsed ?? false,
        premiumVersion: item.premiumVersion ?? item.visualVersion ?? null,
        source: item.source ?? null,
        visualMetadata: item.visualMetadata ?? null,
        status: item.status,
      }))
    : [];

  return {
    ok: true,
    summary: {
      total: items.length,
      premiumV2: items.filter((item: any) => item.visualVersion === "premium_v2").length,
      localTemplate: items.filter((item: any) => item.provider === "local_template").length,
      fallbackUsed: items.filter((item: any) => item.fallbackUsed).length,
      providerMetadataMissing: items.filter((item: any) => !item.provider || !item.premiumVersion).length,
      telegramImageOk: items.filter((item: any) => item.telegramImageStatus === "OK").length,
      strong: items.filter((item: any) => item.imageQuality === "strong").length,
      medium: items.filter((item: any) => item.imageQuality === "medium").length,
      weak: items.filter((item: any) => item.imageQuality === "weak").length,
    },
    items,
    report,
  };
}

function parseJson(stdout: string) {
  const trimmed = stdout.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}
