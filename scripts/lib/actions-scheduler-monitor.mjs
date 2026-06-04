import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadLocalEnv } from "./load-local-env.mjs";

const root = process.cwd();
const workflowsDir = path.join(root, ".github", "workflows");
const publishWorkflowName = "publish-scheduler.yml";
const runtimeDir = path.join(root, "data", "runtime");

export async function getActionsSchedulerMonitorReport(options = {}) {
  if (options.loadEnv) {
    loadLocalEnv({ cwd: root });
  }

  const lastCheckedAt = new Date().toISOString();
  const workflow = getWorkflowStatus();
  const scheduler = getSchedulerSafety(workflow);
  const queue = getQueueStatus(lastCheckedAt);
  const telegram = getTelegramFlags();
  const githubActions = await getGithubActionsStatus(workflow.workflowFile);
  const warnings = [
    ...workflow.warnings,
    ...scheduler.warnings,
    ...queue.warnings,
    ...telegram.warnings,
    ...githubActions.warnings,
  ];
  const errors = [
    ...workflow.errors,
    ...scheduler.errors,
    ...queue.errors,
    ...telegram.errors,
    ...githubActions.errors,
  ];

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    workflow,
    scheduler,
    queue,
    telegram,
    githubActions,
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

function getWorkflowStatus() {
  const warnings = [];
  const errors = [];
  const workflowFiles = listWorkflowFiles();
  const publishWorkflowPath = path.join(workflowsDir, publishWorkflowName);
  const candidate = existsSync(publishWorkflowPath)
    ? publishWorkflowPath
    : workflowFiles.find((filePath) => {
        const content = readText(filePath);
        return /telegram/i.test(content) || /publish:due/i.test(content);
      }) ?? null;

  if (!workflowFiles.length) {
    errors.push("No GitHub Actions workflow files were found.");
  }

  if (!candidate) {
    errors.push("Telegram publishing workflow was not found.");
    return {
      workflowFiles: workflowFiles.map((filePath) => relative(filePath)),
      workflowFile: null,
      workflowName: null,
      hasSchedule: false,
      scheduleCron: [],
      hasWorkflowDispatch: false,
      hasPushTrigger: false,
      branch: gitValue(["branch", "--show-current"]),
      status: "error",
      warnings,
      errors,
    };
  }

  const content = readText(candidate);
  const workflowName = readWorkflowName(content);
  const scheduleCron = Array.from(content.matchAll(/cron:\s*["']?([^"'\r\n]+)["']?/g)).map((match) => match[1].trim());
  const hasSchedule = /^\s*schedule\s*:/m.test(content);
  const hasWorkflowDispatch = /^\s*workflow_dispatch\s*:/m.test(content);
  const hasPushTrigger = hasOnTrigger(content, "push");

  if (!hasSchedule && !hasWorkflowDispatch) {
    errors.push("Publishing workflow has neither schedule nor workflow_dispatch trigger.");
  }
  if (hasPushTrigger) {
    warnings.push("Publishing workflow has a push trigger.");
  }

  return {
    workflowFiles: workflowFiles.map((filePath) => relative(filePath)),
    workflowFile: relative(candidate),
    workflowName,
    hasSchedule,
    scheduleCron,
    hasWorkflowDispatch,
    hasPushTrigger,
    branch: gitValue(["branch", "--show-current"]),
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    warnings,
    errors,
  };
}

function getSchedulerSafety(workflow) {
  const warnings = [];
  const errors = [];
  const workflowStatus = gitValue(["status", "--short", "--", ".github/workflows/publish-scheduler.yml"]) ?? "";
  const publishSchedulerChanged = Boolean(workflowStatus.trim());
  const productionStoreMode = getProductionStoreMode();
  const sourceOfTruth = "json";
  const safeToSwitchToSupabase = false;

  if (publishSchedulerChanged) {
    errors.push("publish-scheduler.yml has local changes.");
  }
  if (!workflow.hasSchedule && !workflow.hasWorkflowDispatch) {
    errors.push("Publishing workflow does not expose schedule or workflow_dispatch.");
  }
  if (productionStoreMode !== "json") {
    errors.push("Accidental postgres production mode detected.");
  }

  return {
    publishSchedulerChanged,
    hasSchedule: workflow.hasSchedule,
    hasWorkflowDispatch: workflow.hasWorkflowDispatch,
    productionStoreMode,
    sourceOfTruth,
    productionSourceIsJson: productionStoreMode === "json" && sourceOfTruth === "json",
    safeToSwitchToSupabase,
    accidentalPostgresProductionMode: productionStoreMode === "postgres",
    warnings,
    errors,
  };
}

function getQueueStatus(nowIso) {
  const warnings = [];
  const errors = [];
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, errors);
  const scheduledPosts = readJson(path.join(runtimeDir, "scheduled-posts.json"), [], errors);
  const logs = readJson(path.join(runtimeDir, "publication_logs.json"), [], errors);
  const targets = readJson(path.join(runtimeDir, "telegram-targets.json"), {}, errors);
  const items = Array.isArray(plan.items) ? plan.items : [];
  const queue = Array.isArray(scheduledPosts) ? scheduledPosts : [];
  const publicationLogs = Array.isArray(logs) ? logs : [];
  const now = new Date(nowIso);
  const today = nowIso.slice(0, 10);
  const candidates = [...items, ...queue]
    .map((post) => ({
      postId: stringOrNull(post.postId) ?? stringOrNull(post.id),
      channelId: stringOrNull(post.channelId),
      channelName: stringOrNull(post.channelName),
      status: String(post.status ?? ""),
      scheduledAt: stringOrNull(post.scheduledAt) ?? stringOrNull(post.publishAt),
    }))
    .filter((post) => post.scheduledAt && !["published", "cancelled", "canceled"].includes(post.status))
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
  const nextDue = candidates.find((post) => new Date(post.scheduledAt).getTime() >= now.getTime()) ?? candidates[0] ?? null;
  const channelIds = new Set([
    ...items.map((post) => stringOrNull(post.channelId)).filter(Boolean),
    ...Object.keys(isPlainObject(targets) ? targets : {}),
  ]);
  const channelsLinked = Object.values(isPlainObject(targets) ? targets : {}).filter((target) => Boolean(target?.telegramTarget)).length;

  return {
    readyPosts: items.filter((post) => ["ready", "approved"].includes(String(post.status ?? ""))).length,
    scheduledPosts: items.filter((post) => String(post.status ?? "") === "scheduled").length + queue.length,
    publishedToday: countLogsToday(publicationLogs, today, ["published", "success"]),
    failedToday: countLogsToday(publicationLogs, today, ["failed", "error"]),
    skippedToday: countLogsToday(publicationLogs, today, ["skipped"]),
    nextDuePost: nextDue?.postId ?? null,
    nextDueChannel: nextDue?.channelId ?? null,
    nextDueChannelName: nextDue?.channelName ?? null,
    nextDueTime: nextDue?.scheduledAt ?? null,
    channelsLinked,
    channelsTotal: channelIds.size,
    warnings,
    errors,
  };
}

function getTelegramFlags() {
  const warnings = [];
  const botTokenConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);

  if (!botTokenConfigured) {
    warnings.push("TELEGRAM_BOT_TOKEN is not configured.");
  }

  return {
    botTokenConfigured,
    telegramRealPublishEnabled: process.env.TELEGRAM_REAL_PUBLISH_ENABLED ?? null,
    telegramDryRun: process.env.TELEGRAM_DRY_RUN ?? null,
    autopublishEnabled: process.env.AUTOPUBLISH_ENABLED ?? null,
    autopublishTimezone: process.env.AUTOPUBLISH_TIMEZONE ?? null,
    autopublishDailyLimitPerChannel: process.env.AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL ?? null,
    autopublishMaxPostsPerDay: process.env.AUTOPUBLISH_MAX_POSTS_PER_DAY ?? null,
    messageSendAttempted: false,
    warnings,
    errors: [],
  };
}

async function getGithubActionsStatus(workflowFile) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = getGithubRepo();
  const warnings = [];
  const errors = [];

  if (!token) {
    return {
      githubApiAvailable: false,
      tokenConfigured: false,
      repo,
      latestRuns: [],
      message: "GitHub API token is not configured; local workflow checks only",
      warnings,
      errors,
    };
  }

  if (!repo || !workflowFile) {
    warnings.push("GitHub API token is configured, but repository or workflow file could not be resolved.");
    return {
      githubApiAvailable: false,
      tokenConfigured: true,
      repo,
      latestRuns: [],
      message: "GitHub API token is configured, but local repository metadata is incomplete.",
      warnings,
      errors,
    };
  }

  const workflowId = path.basename(workflowFile);
  const url = `https://api.github.com/repos/${repo}/actions/workflows/${encodeURIComponent(workflowId)}/runs?per_page=5`;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "telegram-15-channels-scheduler-monitor",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) {
      warnings.push(`GitHub Actions API returned HTTP ${response.status}.`);
      return {
        githubApiAvailable: false,
        tokenConfigured: true,
        repo,
        latestRuns: [],
        message: "GitHub Actions API request failed.",
        warnings,
        errors,
      };
    }

    const payload = await response.json();
    const latestRuns = Array.isArray(payload.workflow_runs)
      ? payload.workflow_runs.slice(0, 5).map((run) => ({
          id: run.id,
          name: run.name,
          event: run.event,
          status: run.status,
          conclusion: run.conclusion,
          branch: run.head_branch,
          createdAt: run.created_at,
          updatedAt: run.updated_at,
          htmlUrl: run.html_url,
        }))
      : [];

    return {
      githubApiAvailable: true,
      tokenConfigured: true,
      repo,
      latestRuns,
      message: "GitHub Actions latest runs were fetched read-only.",
      warnings,
      errors,
    };
  } catch {
    warnings.push("GitHub Actions API request failed.");
    return {
      githubApiAvailable: false,
      tokenConfigured: true,
      repo,
      latestRuns: [],
      message: "GitHub Actions API request failed.",
      warnings,
      errors,
    };
  }
}

function listWorkflowFiles() {
  if (!existsSync(workflowsDir)) return [];
  return readdirSync(workflowsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
    .map((entry) => path.join(workflowsDir, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

function readWorkflowName(content) {
  const match = content.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  return match ? match[1].trim() : null;
}

function hasOnTrigger(content, trigger) {
  const lines = content.split(/\r?\n/);
  const onIndex = lines.findIndex((line) => /^on:\s*$/.test(line));
  if (onIndex === -1) return false;
  for (let index = onIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\S/.test(line) && line.trim()) break;
    if (new RegExp(`^\\s{2}${trigger}\\s*:`).test(line) || new RegExp(`^\\s*-\\s*${trigger}\\s*$`).test(line)) {
      return true;
    }
  }
  return false;
}

function getProductionStoreMode() {
  const envMode = process.env.PUBLISH_DUE_STORE;
  if (envMode) return envMode === "postgres" ? "postgres" : "json";

  const workflowPath = path.join(workflowsDir, publishWorkflowName);
  const workflow = readText(workflowPath);
  const match = workflow.match(/PUBLISH_DUE_STORE:\s*["']?([^"'\r\n]+)["']?/);
  if (match) return match[1].trim() === "postgres" ? "postgres" : "json";

  return "json";
}

function readJson(filePath, fallback, errors) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(filePath)} could not be parsed.`);
    return fallback;
  }
}

function countLogsToday(logs, today, statuses) {
  return logs.filter((log) => {
    const createdAt = typeof log.createdAt === "string" ? log.createdAt : "";
    const status = String(log.status ?? "").toLowerCase();
    return createdAt.startsWith(today) && statuses.includes(status);
  }).length;
}

function getGithubRepo() {
  const remote = gitValue(["remote", "get-url", "origin"]);
  if (!remote) return null;
  const httpsMatch = remote.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/);
  return httpsMatch ? httpsMatch[1] : null;
}

function readText(filePath) {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

function gitValue(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}
