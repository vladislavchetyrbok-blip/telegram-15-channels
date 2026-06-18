import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { loadLocalEnv } from "./lib/load-local-env.mjs";
import { readLedgerReadOnly, summarizeDate, validateIsoDate } from "./lib/zodiac-autonomy.mjs";

const root = process.cwd();
const workflowRelativePath = ".github/workflows/zodiac-scheduler.yml";
const workflowPath = path.join(root, workflowRelativePath);
const expectedWorkflowName = "Zodiac Daily Publisher";
const expectedCrons = ["0 6 * * *", "30 6 * * *", "0 7 * * *", "30 7 * * *", "0 8 * * *"];
const githubApiVersion = "2022-11-28";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--date") {
      options.date = args[++index] ?? null;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  if (options.date !== null) {
    const dateValidation = validateIsoDate(options.date);
    if (!dateValidation.ok) errors.push(dateValidation.error);
  }

  return { options, errors };
}

function checkWorkflow() {
  const warnings = [];
  const errors = [];

  if (!existsSync(workflowPath)) {
    errors.push(`${workflowRelativePath} was not found.`);
    return {
      workflowFile: workflowRelativePath,
      exists: false,
      workflowName: null,
      expectedWorkflowName,
      crons: [],
      missingCrons: expectedCrons,
      unexpectedCrons: [],
      checks: baseWorkflowChecks(false),
      warnings,
      errors,
    };
  }

  const content = readFileSync(workflowPath, "utf8");
  const workflowName = readWorkflowName(content);
  const crons = readCronAttempts(content);
  const missingCrons = expectedCrons.filter((cron) => !crons.includes(cron));
  const unexpectedCrons = crons.filter((cron) => !expectedCrons.includes(cron));
  const checks = {
    workflowExists: true,
    workflowNameMatches: workflowName === expectedWorkflowName,
    hasAllBackupCrons: missingCrons.length === 0,
    scheduleModeLive: /if \[ "\$\{\{ github\.event_name \}\}" = "schedule" \]; then\s+RUN_MODE="live"/m.test(content),
    targetDateUsesEuropeKyiv: content.includes('TARGET_DATE=$(TZ="Europe/Kyiv" date +%Y-%m-%d)'),
    liveCommandLedgerProtected: content.includes("ZODIAC_LEDGER_GIT_PERSIST=true npm run zodiac:publish-date:live"),
    manualDispatchDefaultDryRun: /^\s*workflow_dispatch\s*:/m.test(content) && /default:\s*["']?dry-run["']?/m.test(content),
    dailyReportGenerated: content.includes("npm run zodiac:report:daily"),
    dailyReportArtifactUploaded: content.includes("actions/upload-artifact@v4") && content.includes("data/runtime/zodiac-daily-report-${{ steps.target.outputs.date }}.json"),
  };

  if (!checks.workflowNameMatches) errors.push(`Workflow name must be "${expectedWorkflowName}", got "${workflowName ?? "missing"}".`);
  if (!checks.hasAllBackupCrons) errors.push(`Missing cron attempt(s): ${missingCrons.join(", ")}.`);
  if (!checks.scheduleModeLive) errors.push('Scheduled runs must set RUN_MODE="live".');
  if (!checks.targetDateUsesEuropeKyiv) errors.push('Target date must use TZ="Europe/Kyiv" date +%Y-%m-%d.');
  if (!checks.liveCommandLedgerProtected) errors.push("Live command must use ZODIAC_LEDGER_GIT_PERSIST=true npm run zodiac:publish-date:live.");
  if (!checks.manualDispatchDefaultDryRun) errors.push('workflow_dispatch default mode must remain "dry-run".');
  if (!checks.dailyReportGenerated) errors.push("Workflow must generate the post-run daily report.");
  if (!checks.dailyReportArtifactUploaded) errors.push("Workflow must upload the daily report artifact.");
  if (unexpectedCrons.length > 0) warnings.push(`Unexpected extra cron attempt(s): ${unexpectedCrons.join(", ")}.`);

  return {
    workflowFile: workflowRelativePath,
    exists: true,
    workflowName,
    expectedWorkflowName,
    crons,
    expectedCrons,
    missingCrons,
    unexpectedCrons,
    checks,
    warnings,
    errors,
  };
}

function baseWorkflowChecks(value) {
  return {
    workflowExists: value,
    workflowNameMatches: value,
    hasAllBackupCrons: value,
    scheduleModeLive: value,
    targetDateUsesEuropeKyiv: value,
    liveCommandLedgerProtected: value,
    manualDispatchDefaultDryRun: value,
    dailyReportGenerated: value,
    dailyReportArtifactUploaded: value,
  };
}

function readDateStatus(date) {
  if (!date) return null;

  const warnings = [];
  const errors = [];
  let ledgerSummary = null;
  let ledgerWarning = null;

  try {
    const ledger = readLedgerReadOnly();
    ledgerWarning = ledger.warning;
    const summary = summarizeDate(ledger.entries, date);
    ledgerSummary = {
      expectedCount: summary.expectedCount,
      sentCount: summary.sentCount,
      alreadySentCount: summary.sentCount,
      failedCount: summary.failedCount,
      pendingCount: summary.pendingCount,
      lockedInProgressCount: summary.lockedInProgressCount,
      missingCount: summary.perChannel.filter((row) => row.status === "missing").length,
      skippedCount: summary.skippedCount,
      duplicateBlockedCount: summary.duplicateBlockedCount,
      perChannel: summary.perChannel.map((row) => ({
        slug: row.slug,
        status: row.status,
        hasLedgerEntry: row.hasLedgerEntry,
        updatedAt: row.updatedAt,
      })),
    };
    if (ledgerWarning) warnings.push(ledgerWarning);
  } catch (error) {
    errors.push(`Unable to read local zodiac ledger: ${error instanceof Error ? error.message : String(error)}`);
  }

  const reportPath = path.join(root, "data", "runtime", `zodiac-daily-report-${date}.json`);
  const report = readLocalDailyReport(reportPath, warnings);

  return {
    date,
    ledger: ledgerSummary,
    report,
    warnings,
    errors,
  };
}

function readLocalDailyReport(reportPath, warnings) {
  const relativeReportPath = relative(reportPath);
  if (!existsSync(reportPath)) {
    warnings.push(`Local daily report not found: ${relativeReportPath}.`);
    return {
      exists: false,
      path: relativeReportPath,
      expectedCount: null,
      sentCount: null,
      alreadySentCount: null,
      failedCount: null,
      pendingCount: null,
      lockedInProgressCount: null,
      missingCount: null,
      skippedCount: null,
      duplicateBlockedCount: null,
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(reportPath, "utf8"));
    const perChannel = Array.isArray(parsed.perChannel) ? parsed.perChannel : [];
    return {
      exists: true,
      path: relativeReportPath,
      expectedCount: numberOrNull(parsed.expectedCount),
      sentCount: numberOrNull(parsed.sentCount),
      alreadySentCount: numberOrNull(parsed.sentCount),
      failedCount: numberOrNull(parsed.failedCount),
      pendingCount: numberOrNull(parsed.pendingCount),
      lockedInProgressCount: numberOrNull(parsed.lockedInProgressCount),
      missingCount: perChannel.filter((row) => String(row.status || "").toLowerCase() === "missing").length,
      skippedCount: numberOrNull(parsed.skippedCount),
      duplicateBlockedCount: numberOrNull(parsed.duplicateBlockedCount),
      ledgerWrites: numberOrNull(parsed.ledgerWrites),
      publishCalls: numberOrNull(parsed.publishCalls),
      schedulerCalls: numberOrNull(parsed.schedulerCalls),
    };
  } catch (error) {
    warnings.push(`Local daily report could not be parsed: ${relativeReportPath}.`);
    return {
      exists: false,
      path: relativeReportPath,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

async function readGithubActionsStatus({ date }) {
  loadOptionalEnvFiles();
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = getGithubRepo();
  const warnings = [];
  const errors = [];

  if (!token) {
    warnings.push("GitHub API token not configured; static workflow checks completed");
    return {
      githubApiAvailable: false,
      tokenConfigured: false,
      repo,
      workflowId: path.basename(workflowRelativePath),
      latestRuns: [],
      targetDateRuns: [],
      message: "GitHub API token not configured; static workflow checks completed",
      warnings,
      errors,
    };
  }

  if (!repo) {
    warnings.push("GitHub API token is configured, but origin GitHub repository could not be resolved.");
    return {
      githubApiAvailable: false,
      tokenConfigured: true,
      repo,
      workflowId: path.basename(workflowRelativePath),
      latestRuns: [],
      targetDateRuns: [],
      message: "GitHub API token configured, but repository metadata is incomplete.",
      warnings,
      errors,
    };
  }

  const workflowId = path.basename(workflowRelativePath);
  const runsUrl = `https://api.github.com/repos/${repo}/actions/workflows/${encodeURIComponent(workflowId)}/runs?branch=main&per_page=20`;

  try {
    const payload = await fetchJson(runsUrl, token);
    const latestRuns = Array.isArray(payload.workflow_runs)
      ? payload.workflow_runs.slice(0, 10).map(mapWorkflowRun)
      : [];
    const targetDateRuns = date
      ? await enrichRunsWithJobsAndLogs({
          repo,
          token,
          runs: latestRuns.filter((run) => run.startedAtKyivDate === date || run.createdAtKyivDate === date),
        })
      : [];

    return {
      githubApiAvailable: true,
      tokenConfigured: true,
      repo,
      workflowId,
      latestRuns,
      targetDateRuns,
      message: "GitHub Actions latest Zodiac Daily Publisher runs fetched read-only.",
      warnings,
      errors,
    };
  } catch (error) {
    warnings.push(`GitHub Actions API request failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      githubApiAvailable: false,
      tokenConfigured: true,
      repo,
      workflowId,
      latestRuns: [],
      targetDateRuns: [],
      message: "GitHub Actions API request failed.",
      warnings,
      errors,
    };
  }
}

async function enrichRunsWithJobsAndLogs({ repo, token, runs }) {
  const enriched = [];
  for (const run of runs.slice(0, 5)) {
    const next = { ...run, jobs: [], logSignals: {} };
    try {
      const jobsPayload = await fetchJson(`https://api.github.com/repos/${repo}/actions/runs/${run.id}/jobs?per_page=10`, token);
      const jobs = Array.isArray(jobsPayload.jobs) ? jobsPayload.jobs : [];
      next.jobs = jobs.map((job) => ({
        id: job.id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        htmlUrl: job.html_url,
      }));
      const logText = await fetchJobLogs(repo, token, jobs[0]?.id);
      next.logSignals = parseWorkflowLogSignals(logText);
    } catch (error) {
      next.logWarning = error instanceof Error ? error.message : String(error);
    }
    enriched.push(next);
  }
  return enriched;
}

async function fetchJobLogs(repo, token, jobId) {
  if (!jobId) return "";
  const response = await fetch(`https://api.github.com/repos/${repo}/actions/jobs/${jobId}/logs`, {
    headers: githubHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`Job log fetch returned HTTP ${response.status}.`);
  }
  return response.text();
}

function parseWorkflowLogSignals(logText) {
  if (!logText) return {};
  return {
    cronContext: matchLogValue(logText, "Cron context"),
    targetDate: matchLogValue(logText, "Zodiac target date"),
    mode: matchLogValue(logText, "Zodiac mode"),
    alreadySent: numberFromLog(logText, "Already Sent"),
    duplicateBlocked: numberFromLog(logText, "Duplicate Blocked"),
    telegramApiCalls: numberFromLog(logText, "Telegram API Calls"),
    livePublishCalls: numberFromLog(logText, "Live Publish Calls"),
  };
}

function matchLogValue(logText, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = logText.match(new RegExp(`${escaped}\\s*:\\s*([^\\r\\n]+)`));
  return match ? match[1].trim() : null;
}

function numberFromLog(logText, label) {
  const value = matchLogValue(logText, label);
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: githubHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "telegram-15-channels-zodiac-daily-workflow-monitor",
    "X-GitHub-Api-Version": githubApiVersion,
  };
}

function mapWorkflowRun(run) {
  return {
    id: run.id,
    name: run.name,
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    branch: run.head_branch,
    displayTitle: run.display_title,
    createdAt: run.created_at,
    runStartedAt: run.run_started_at,
    updatedAt: run.updated_at,
    createdAtKyivDate: kyivDate(run.created_at),
    startedAtKyivDate: kyivDate(run.run_started_at || run.created_at),
    createdAtKyiv: kyivDateTime(run.created_at),
    runStartedAtKyiv: kyivDateTime(run.run_started_at || run.created_at),
    htmlUrl: run.html_url,
  };
}

function readWorkflowName(content) {
  const match = content.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  return match ? match[1].trim() : null;
}

function readCronAttempts(content) {
  return Array.from(content.matchAll(/cron:\s*["']?([^"'\r\n]+)["']?/g)).map((match) => match[1].trim());
}

function loadOptionalEnvFiles() {
  loadLocalEnv({ cwd: root, path: path.join(root, ".env.local") });
  loadLocalEnv({ cwd: root, path: path.join(root, ".env") });
}

function getGithubRepo() {
  const remote = gitValue(["remote", "get-url", "origin"]);
  if (!remote) return null;
  const match = remote.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/);
  return match ? match[1] : null;
}

function gitValue(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function kyivDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function kyivDateTime(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value)).replace(" ", "T");
}

function numberOrNull(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

const { options, errors: argErrors } = parseArgs();
const workflow = checkWorkflow();
const dateStatus = readDateStatus(options.date);
const githubActions = await readGithubActionsStatus({ date: options.date });
const warnings = [
  ...workflow.warnings,
  ...(dateStatus?.warnings ?? []),
  ...githubActions.warnings,
];
const errors = [
  ...argErrors,
  ...workflow.errors,
  ...(dateStatus?.errors ?? []),
  ...githubActions.errors,
];

const report = {
  status: errors.length ? "error" : warnings.length ? "warning" : "ok",
  checkedAt: new Date().toISOString(),
  date: options.date,
  workflow,
  dateStatus,
  githubActions,
  telegramApiCalls: 0,
  livePublishCalls: 0,
  ledgerWrites: 0,
  warnings: Array.from(new Set(warnings)),
  errors: Array.from(new Set(errors)),
};

console.log(JSON.stringify(report, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
