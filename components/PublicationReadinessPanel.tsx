"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ImageIcon, RefreshCw, Send, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelLogoControl } from "@/components/ChannelLogoControl";
import { TelegramQuickTestPanel } from "@/components/TelegramQuickTestPanel";
import { TelegramQuickPublishPanel } from "@/components/TelegramQuickPublishPanel";

interface ReadinessChannel {
  channelId: string;
  channelTitle: string;
  description: string;
  topic: string;
  language: string;
  logoPath: string;
  platformLogoUrl: string;
  platformLogoSource: "custom" | "generated";
  platformLogoStatus: "logo OK" | "missing" | "fallback";
  telegramAvatarStatus: "manual_configured" | "unknown" | "not_configured";
  telegramAvatarLabel: string;
  iconPath: string;
  previewPath: string;
  logoOk: boolean;
  iconOk: boolean;
  previewOk: boolean;
  postsTotal: number;
  postsWithImages: number;
  postsWithoutImages: number;
  postsWithBrokenImagePath: number;
  postsWithInvalidChannelAssetImage: number;
  postsWithForbiddenCurrency: number;
  postsReadyForTest: number;
  postsNotReady: number;
  hasTelegramChannelConfig: boolean;
  sampleImagePath: string;
  sampleFileExists: boolean;
  postImageStatus: "OK" | "Missing" | "Path broken" | "Invalid";
  textViolations: number;
  brokenText: number;
  failedGeneration: number;
  status: "ready_for_test" | "not_ready";
  readinessReasons: string[];
}

interface ReadinessState {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  dryRun: boolean;
  realSendingEnabled: boolean;
  realSendsTotal: number;
  counters: {
    channelsTotal: number;
    telegramAvatarsManualConfigured: number;
    telegramAvatarsUnknown: number;
    platformLogosCustom: number;
    platformLogosGenerated: number;
    platformLogosMissing: number;
    readyForTest: number;
    notReady: number;
    channelsBlocked: number;
    postsWithImages: number;
    postsWithoutImages: number;
    postsWithBrokenImagePath: number;
    postsWithInvalidChannelAssetImage: number;
    postsWithForbiddenCurrency: number;
    postsReadyForTest: number;
    postsNotReady: number;
    postsTotal: number;
    textOk: number;
    brokenText: number;
    failedGeneration: number;
    blockedFromPublish: number;
    telegramConnectionOk: boolean;
    testPublishReady: boolean;
    realPublishAllowed: boolean;
    blockers: {
      postImages: number;
      textQuality: number;
      forbiddenCurrency: number;
      telegramConnection: number;
      testPublishStatus: number;
      realPublishPermission: number;
    };
    brokenAssetLinks: number;
    realSendsTotal: number;
  };
  channels: ReadinessChannel[];
}

interface LogoAuditState {
  totalChannels: number;
  customLogosUploaded: number;
  generatedRemaining: number;
  brokenPaths: number;
}

interface TestResult {
  ok: boolean;
  status: "test_published" | "not_ready";
  channel?: ReadinessChannel;
  error?: string;
  message?: string;
  telegramSent: false;
}

interface SandboxResult {
  ok: boolean;
  mode: "dry-run" | "real-test";
  telegramSent: boolean;
  telegramApiCalled: boolean;
  selectedChannelTitle: string;
  selectedPost: string;
  target: string;
  postStatus: "ready_for_test" | "test_published" | "not_ready";
  result: "ready" | "sent" | "blocked" | "failed";
  error: string | null;
  payload: {
    target: string;
    title: string;
    text: string;
    imageUrl: string;
    imageFilePath: string;
    parseMode: "HTML";
    buttons: Array<{ text: string; url: string }>;
  };
  checks: {
    channelId: boolean;
    title: boolean;
    text: boolean;
    imageUrl: boolean;
    imageFileExists: boolean;
    imageBrowserPath: boolean;
    imageIsPostAsset: boolean;
    forbiddenCurrency: number;
    readyForTest: boolean;
    realChannelsUntouched: true;
  };
  message: string;
  updatedAt: string;
}

interface BatchSandboxPayload {
  sourceChannelId: string;
  sourceChannelName: string;
  postId: string;
  title: string;
  text: string;
  imageUrl: string;
  imageFilePath: string;
  targetMode: "sandbox" | "test_chat" | "mock";
  target: string;
  parseMode: "HTML";
  buttons: Array<{ text: string; url: string }>;
  status: "ready_for_test" | "dry_run_success" | "test_published" | "not_ready";
  issues: string[];
}

interface BatchSandboxResult {
  ok: boolean;
  mode: "dry-run" | "real-test";
  telegramSent: boolean;
  telegramApiCalled: boolean;
  allowRealPublish: false;
  realChannelsUntouched: true;
  totalChannels: number;
  selectedTestPosts: number;
  postImages: number;
  passedPreflight: number;
  failedPreflight: number;
  testPublished: number;
  dryRunSuccess: number;
  errors: Array<{
    channelId: string;
    channelName: string;
    postId: string | null;
    issues: string[];
  }>;
  payloads: BatchSandboxPayload[];
  message: string;
  updatedAt: string;
}

interface TelegramTestSendResult {
  ok: boolean;
  mode: "dry-run" | "real_single_test";
  telegramSent: boolean;
  telegramApiCalled: boolean;
  realMassPublishEnabled: false;
  massBroadcast: false;
  channelsTouched: 0 | 1;
  tokenMasked: string;
  testChannelConfigured: boolean;
  selectedPost: string | null;
  selectedChannelTitle: string | null;
  messageId: number | null;
  status: "dry_run_preview" | "test_published" | "blocked" | "failed";
  message: string;
  error: string | null;
  payload: {
    targetMode: "dry-run" | "real_single_test";
    target: string;
    method: "sendPhoto";
    postId: string;
    channelId: string;
    sourceChannelTitle: string;
    selectedChannelTitle: string;
    title: string;
    text: string;
    caption: string;
    imageUrl: string;
    imageFilePath: string;
    parseMode: "HTML";
  } | null;
  checks: Array<{ key: string; ok: boolean; message: string }>;
  updatedAt: string;
}

interface TelegramTestSendStatus {
  ok: boolean;
  mode: "dry-run" | "real_single_test";
  telegramSent: false;
  realMassPublishEnabled: false;
  massBroadcast: false;
  tokenMasked: string;
  testChannelConfigured: boolean;
  selectedChannelTitle: string | null;
  targets: Array<{
    envKey: string;
    channelId: string;
    channelTitle: string;
    configured: boolean;
    targetMasked: string;
  }>;
  latest: TelegramTestSendResult | null;
}

interface TelegramAccessResult {
  ok: boolean;
  tokenConfigured: boolean;
  getMeOk: boolean;
  botUsername: string | null;
  linked: number;
  channelsTotal: number;
  chatFound: number;
  accessOk: number;
  botAdmin: number;
  canPost: number;
  checks: Array<{
    channelId: string;
    channelName: string;
    telegramTarget: string;
    chatFound: boolean;
    chatTitle: string | null;
    accessStatus: "OK" | "ERROR";
    botAdmin: boolean;
    canPost: boolean;
    exactError: string | null;
  }>;
  checkedAt: string;
}

export function PublicationReadinessPanel() {
  const [state, setState] = useState<ReadinessState | null>(null);
  const [testedChannels, setTestedChannels] = useState<Record<string, boolean>>({});
  const [sandboxResult, setSandboxResult] = useState<SandboxResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchSandboxResult | null>(null);
  const [telegramTestStatus, setTelegramTestStatus] = useState<TelegramTestSendStatus | null>(null);
  const [telegramTestResult, setTelegramTestResult] = useState<TelegramTestSendResult | null>(null);
  const [telegramAccess, setTelegramAccess] = useState<TelegramAccessResult | null>(null);
  const [selectedTargetEnvKey, setSelectedTargetEnvKey] = useState<string>("");
  const [logoAudit, setLogoAudit] = useState<LogoAuditState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Проверка готовности не запускалась.");

  const loadState = useCallback(async () => {
    try {
      setBusy("check");
      const [response, logoResponse, telegramTestResponse] = await Promise.all([
        fetch("/api/publication-readiness", { cache: "no-store" }),
        fetch("/api/custom-logos/audit", { cache: "no-store" }),
        fetch("/api/telegram/test-send", { cache: "no-store" }),
      ]);
      const payload = (await response.json()) as ReadinessState;
      const logoPayload = (await logoResponse.json()) as LogoAuditState;
      const telegramTestPayload = (await telegramTestResponse.json()) as TelegramTestSendStatus;
      setState(payload);
      setLogoAudit(logoPayload);
      setTelegramTestStatus(telegramTestPayload);
      setTelegramTestResult(telegramTestPayload.latest);
      setSelectedTargetEnvKey((current) => current || telegramTestPayload.targets.find((target) => target.configured)?.envKey || telegramTestPayload.targets[0]?.envKey || "");
      setMessage(payload.ok ? "Все 15 каналов готовы к тестовой публикации в dry-run." : "Есть элементы, которые нужно проверить.");
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  async function testPublication(channelId: string) {
    try {
      setBusy(channelId);
      const response = await fetch("/api/publication-readiness/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });
      const payload = (await response.json()) as TestResult;
      setTestedChannels((current) => ({ ...current, [channelId]: payload.ok }));
      setMessage(payload.ok ? payload.message ?? "Тестовая публикация готова." : payload.error ?? "Проверка не прошла.");
    } finally {
      setBusy(null);
    }
  }

  async function regeneratePostImages() {
    try {
      setBusy("post-images");
      const response = await fetch("/api/post-images/regenerate-missing", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        createdFiles?: string[];
        fixedPaths?: unknown[];
        after?: { postsWithImages: number; postsWithoutImages: number; postsWithBrokenImagePath: number };
      };
      await loadState();
      setMessage(
        `Post images checked. Created: ${payload.createdFiles?.length ?? 0}. Fixed paths: ${payload.fixedPaths?.length ?? 0}. Missing: ${payload.after?.postsWithoutImages ?? 0}. Broken: ${payload.after?.postsWithBrokenImagePath ?? 0}.`,
      );
    } finally {
      setBusy(null);
    }
  }

  async function fixBrokenImagePaths() {
    try {
      setBusy("fix-paths");
      const response = await fetch("/api/post-images/fix-broken-paths", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        createdFiles?: string[];
        fixedPaths?: unknown[];
        after?: { postsWithImages: number; postsWithoutImages: number; postsWithBrokenImagePath: number };
      };
      await loadState();
      setMessage(
        `Broken paths fixed. Created: ${payload.createdFiles?.length ?? 0}. Fixed paths: ${payload.fixedPaths?.length ?? 0}. Missing: ${payload.after?.postsWithoutImages ?? 0}. Broken: ${payload.after?.postsWithBrokenImagePath ?? 0}.`,
      );
    } finally {
      setBusy(null);
    }
  }

  async function runSandboxPublication() {
    try {
      setBusy("test-sandbox");
      const response = await fetch("/api/publication-readiness/test-publish-sandbox", {
        method: "POST",
      });
      const payload = (await response.json()) as SandboxResult;
      setSandboxResult(payload);
      setMessage(payload.ok ? payload.message : payload.error ?? "Test publish sandbox failed.");
    } finally {
      setBusy(null);
    }
  }

  async function runBatchSandboxPublication() {
    try {
      setBusy("batch-sandbox");
      const response = await fetch("/api/publication-readiness/test-batch-sandbox", {
        method: "POST",
      });
      const payload = (await response.json()) as BatchSandboxResult;
      setBatchResult(payload);
      setMessage(payload.ok ? payload.message : payload.message || "Batch sandbox preflight failed.");
    } finally {
      setBusy(null);
    }
  }

  async function runTelegramTestSend() {
    try {
      setBusy("telegram-test-send");
      const response = await fetch("/api/telegram/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: "ukraine-market-post-001", channelId: "ukraine-market", targetEnvKey: selectedTargetEnvKey }),
      });
      const payload = (await response.json()) as TelegramTestSendResult;
      setTelegramTestResult(payload);
      setTelegramTestStatus((current) => current ? { ...current, latest: payload, mode: payload.mode, telegramSent: false } : null);
      setMessage(
        payload.ok
          ? payload.mode === "dry-run"
            ? "Test-send готов: сформирован dry-run payload, Telegram API не вызывался."
            : "1 тестовый пост отправлен в выбранный канал."
          : payload.error ?? "Test-send preflight failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function checkTelegramAccess() {
    try {
      setBusy("telegram-access");
      const response = await fetch("/api/telegram/check-all-access", { method: "POST" });
      const payload = (await response.json()) as TelegramAccessResult;
      setTelegramAccess(payload);
      setMessage(
        payload.ok
          ? "Доступ бота проверен. Доступные каналы могут участвовать в автопубликации."
          : "Проверка доступа нашла проблемы. Каналы с ошибками будут заблокированы, остальные можно проверять отдельно.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Publication readiness</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Готово к публикации</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Финальная проверка 15 каналов: публикацию блокируют только проблемы постов, текста, валютной политики и Telegram-настроек.
              Логотипы каналов нужны для dashboard, но не являются критическим условием публикации.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadState}
              disabled={Boolean(busy)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", busy === "check" && "animate-spin")} />
              Проверить готовность постов
            </button>
            <button
              type="button"
              onClick={regeneratePostImages}
              disabled={Boolean(busy)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ImageIcon className={cn("h-4 w-4", busy === "post-images" && "animate-pulse")} />
              Пересоздать отсутствующие картинки
            </button>
            <button
              type="button"
              onClick={fixBrokenImagePaths}
              disabled={Boolean(busy)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/30 bg-slate-950 px-4 text-sm font-semibold text-amber-100 transition hover:border-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wrench className={cn("h-4 w-4", busy === "fix-paths" && "animate-pulse")} />
              Исправить битые пути
            </button>
          </div>
        </div>
      </section>

      <TelegramQuickTestPanel />

      <TelegramQuickPublishPanel />

      <section className="rounded-lg border border-line bg-panel/70 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Post image control</p>
          <h3 className="text-lg font-semibold text-white">Проверка картинок постов</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <Metric label="Total posts" value={state?.counters.postsTotal ?? 0} tone="dry" />
          <Metric label="With images" value={state?.counters.postsWithImages ?? 0} tone="ok" />
          <Metric label="Missing images" value={state?.counters.postsWithoutImages ?? 0} tone={(state?.counters.postsWithoutImages ?? 0) ? "error" : "ok"} />
          <Metric label="Broken paths" value={state?.counters.postsWithBrokenImagePath ?? 0} tone={(state?.counters.postsWithBrokenImagePath ?? 0) ? "error" : "ok"} />
          <Metric label="Ready for test" value={state?.counters.postsReadyForTest ?? 0} tone="ok" />
          <Metric label="Not ready" value={state?.counters.postsNotReady ?? 0} tone={(state?.counters.postsNotReady ?? 0) ? "warn" : "ok"} />
        </div>
      </section>

      <section className="rounded-lg border border-amber-300/25 bg-amber-300/5 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Publish blockers</p>
          <h3 className="text-lg font-semibold text-white">Что блокирует публикацию</h3>
          <p className="text-sm text-slate-400">Логотипы каналов здесь не считаются критическими блокерами. Обязательны именно рабочие картинки постов.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <BlockerMetric label="Post images" value={state?.counters.blockers.postImages ?? 0} />
          <BlockerMetric label="Text quality" value={state?.counters.blockers.textQuality ?? 0} />
          <BlockerMetric label="Forbidden currency" value={state?.counters.blockers.forbiddenCurrency ?? 0} />
          <BlockerMetric label="Telegram connection" value={state?.counters.blockers.telegramConnection ?? 0} />
          <BlockerMetric label="Test publish status" value={state?.counters.blockers.testPublishStatus ?? 0} />
          <BlockerMetric label="Real publish permission" value={state?.counters.blockers.realPublishPermission ?? 1} alwaysLocked />
          <BlockerMetric label="Logos" value={0} note="not blocking" />
          <BlockerMetric label="Statistics" value={0} note="not blocking" />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Channel visuals</p>
            <h3 className="text-lg font-semibold text-white">Аватары Telegram, логотипы платформы и картинки постов</h3>
            <p className="mt-1 text-sm text-slate-400">Логотипы каналов не блокируют публикацию. Блокируют только post images и проверки текста.</p>
          </div>
          <button
            type="button"
            onClick={loadState}
            disabled={Boolean(busy)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-300/30 bg-slate-950 px-3 text-xs font-semibold text-cyan-100 hover:border-cyan-200 disabled:opacity-60"
          >
            Проверить готовность постов
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Metric label="Всего каналов" value={logoAudit?.totalChannels ?? 15} tone="dry" />
          <Metric label="Telegram manual" value={state?.counters.telegramAvatarsManualConfigured ?? 15} tone="ok" />
          <Metric label="Telegram unknown" value={state?.counters.telegramAvatarsUnknown ?? 0} tone="warn" />
          <Metric label="Platform custom" value={state?.counters.platformLogosCustom ?? 0} tone="ok" />
          <Metric label="Platform generated" value={state?.counters.platformLogosGenerated ?? 15} tone="dry" />
          <Metric label="Platform missing" value={state?.counters.platformLogosMissing ?? 0} tone={(state?.counters.platformLogosMissing ?? 0) ? "warn" : "ok"} />
          <Metric label="Post images missing" value={state?.counters.postsWithoutImages ?? 0} tone={(state?.counters.postsWithoutImages ?? 0) ? "error" : "ok"} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel/70 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Text quality</p>
          <h3 className="text-lg font-semibold text-white">Проверка текстов</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <Metric label="Total posts" value={state?.counters.postsTotal ?? 0} tone="dry" />
          <Metric label="Text OK" value={state?.counters.textOk ?? 0} tone="ok" />
          <Metric label="Broken text" value={state?.counters.brokenText ?? 0} tone={(state?.counters.brokenText ?? 0) ? "error" : "ok"} />
          <Metric label="Failed generation" value={state?.counters.failedGeneration ?? 0} tone={(state?.counters.failedGeneration ?? 0) ? "error" : "ok"} />
          <Metric label="Ready for test" value={state?.counters.postsReadyForTest ?? 0} tone="ok" />
          <Metric label="Blocked" value={state?.counters.blockedFromPublish ?? 0} tone={(state?.counters.blockedFromPublish ?? 0) ? "warn" : "ok"} />
        </div>
      </section>

      <section className="rounded-lg border border-cyan-300/25 bg-slate-950/70 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Test publish sandbox</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Тестовая публикация</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sandbox проверяет только один выбранный канал и один пост. Реальные 15 каналов не используются, массовая отправка отключена.
            </p>
          </div>
          <button
            type="button"
            onClick={runSandboxPublication}
            disabled={Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={cn("h-4 w-4", busy === "test-sandbox" && "animate-pulse")} />
            Тестовая публикация
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950">
            {sandboxResult?.payload.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sandboxResult.payload.imageUrl} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center text-slate-500">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <p className="truncate px-3 py-2 text-xs text-slate-500">{sandboxResult?.payload.imageUrl ?? "/assets/posts/03-ukraine-opportunities-market/post-001.svg"}</p>
          </div>
          <div className="grid gap-2 text-xs md:grid-cols-3">
            <Info label="Выбранный канал" value={sandboxResult?.selectedChannelTitle ?? "Україна: можливості та ринок"} />
            <Info label="Выбранный пост" value={sandboxResult?.selectedPost ?? "post-001"} />
            <Info label="Telegram target" value={sandboxResult?.target ?? "mock/test receiver"} />
            <Info label="Режим" value={sandboxResult?.mode ?? "dry-run"} />
            <Info label="Telegram API called" value={sandboxResult?.telegramApiCalled ? "yes" : "no"} danger={sandboxResult?.telegramApiCalled} />
            <Info label="telegramSent" value={sandboxResult?.telegramSent ? "true" : "false"} danger={sandboxResult?.telegramSent} />
            <Info label="Post status" value={sandboxResult?.postStatus ?? "ready_for_test"} danger={sandboxResult?.postStatus === "not_ready"} />
            <Info label="Forbidden currency" value={String(sandboxResult?.checks.forbiddenCurrency ?? 0)} danger={(sandboxResult?.checks.forbiddenCurrency ?? 0) > 0} />
            <Info label="Image file" value={sandboxResult?.checks.imageFileExists === false ? "missing" : "OK"} danger={sandboxResult?.checks.imageFileExists === false} />
          </div>
        </div>

        {sandboxResult ? (
          <div className="mt-4 rounded-md border border-line bg-slate-950/70 p-3">
            <p className={cn("text-sm font-semibold", sandboxResult.ok ? "text-emerald-100" : "text-rose-100")}>
              {sandboxResult.ok ? sandboxResult.message : sandboxResult.error}
            </p>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{sandboxResult.payload.title} — {sandboxResult.payload.text}</p>
            <p className="mt-2 break-all text-[11px] text-slate-500">{sandboxResult.payload.imageFilePath}</p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-slate-950 px-3 text-xs font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Реальная публикация
          </button>
          <span className="inline-flex items-center rounded-md border border-slate-500/20 bg-slate-500/10 px-3 text-xs text-slate-300">
            Disabled until sandbox test is complete and explicit production rules are enabled.
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300/25 bg-sky-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-200">Telegram Bot API</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Тестовая отправка в выбранный канал</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Одна проверочная отправка уходит только в выбранный telegramTarget. Массовая публикация и остальные 14 каналов не используются.
              Если TELEGRAM_DRY_RUN=true, возвращается preview payload без вызова Telegram API.
            </p>
          </div>
          <button
            type="button"
            onClick={runTelegramTestSend}
            disabled={Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sky-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={cn("h-4 w-4", busy === "telegram-test-send" && "animate-pulse")} />
            Отправить 1 тестовый пост
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Канал для тестового поста</span>
            <select
              value={selectedTargetEnvKey}
              onChange={(event) => setSelectedTargetEnvKey(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/60"
            >
              {(telegramTestStatus?.targets ?? []).map((target) => (
                <option key={target.envKey} value={target.envKey}>
                  {target.channelTitle} — {target.configured ? target.targetMasked : "missing target"}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={checkTelegramAccess}
            disabled={Boolean(busy)}
            className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md border border-sky-300/30 bg-slate-950 px-4 text-sm font-semibold text-sky-100 transition hover:border-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className={cn("h-4 w-4", busy === "telegram-access" && "animate-pulse")} />
            Проверить доступ бота к 15 каналам
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Info label="Bot token" value={(telegramTestStatus?.tokenMasked ?? "missing") === "missing" ? "missing" : "configured"} danger={(telegramTestStatus?.tokenMasked ?? "missing") === "missing"} />
          <Info label="Test channel ID" value={telegramTestStatus?.testChannelConfigured ? "configured" : "missing"} danger={!telegramTestStatus?.testChannelConfigured && telegramTestStatus?.mode !== "dry-run"} />
          <Info label="Mode" value={telegramTestResult?.mode ?? telegramTestStatus?.mode ?? "dry-run"} />
          <Info label="Selected post" value={telegramTestResult?.selectedPost ?? "ukraine-market-post-001"} />
          <Info label="Selected channel" value={telegramTestResult?.selectedChannelTitle ?? telegramTestStatus?.selectedChannelTitle ?? "not selected"} />
          <Info label="Image file" value={telegramTestResult?.checks.find((check) => check.key === "imageFileExists")?.ok === false ? "missing" : "OK"} danger={telegramTestResult?.checks.find((check) => check.key === "imageFileExists")?.ok === false} />
          <Info label="Method" value={telegramTestResult?.payload?.method ?? "sendPhoto"} />
          <Info label="Telegram API called" value={telegramTestResult?.telegramApiCalled ? "yes" : "no"} />
          <Info label="Real mass publish" value="disabled" />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-md border border-sky-300/20 bg-slate-950">
            {telegramTestResult?.payload?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={telegramTestResult.payload.imageUrl} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center text-slate-500">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <p className="truncate px-3 py-2 text-xs text-slate-500">{telegramTestResult?.payload?.imageUrl ?? "/assets/posts/03-ukraine-opportunities-market/post-001.svg"}</p>
          </div>
          <div className="rounded-md border border-line bg-slate-950/70 p-3">
            <div className="grid gap-2 text-xs md:grid-cols-2">
              <Info label="Target" value={telegramTestResult?.payload?.target ?? "dry-run preview"} />
              <Info label="Target mode" value={telegramTestResult?.payload?.targetMode ?? telegramTestStatus?.mode ?? "dry-run"} />
              <Info label="Post status" value={telegramTestResult?.status ?? "not sent"} danger={telegramTestResult?.status === "blocked" || telegramTestResult?.status === "failed"} />
              <Info label="message_id" value={telegramTestResult?.messageId ? String(telegramTestResult.messageId) : "none"} />
              <Info label="Channels touched" value={String(telegramTestResult?.channelsTouched ?? 0)} danger={(telegramTestResult?.channelsTouched ?? 0) > 1} />
              <Info label="Mass broadcast" value={telegramTestResult?.massBroadcast ? "yes" : "no"} danger={telegramTestResult?.massBroadcast} />
            </div>
            {telegramTestResult?.payload ? (
              <>
                <p className="mt-3 text-sm font-semibold text-slate-100">{telegramTestResult.payload.title}</p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{telegramTestResult.payload.text}</p>
                <p className="mt-2 break-all text-[11px] text-slate-500">{telegramTestResult.payload.imageFilePath}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Last test result отсутствует. Нажмите кнопку, чтобы выполнить dry-run preview или одну реальную тестовую отправку.</p>
            )}
          </div>
        </div>

        {telegramTestResult?.checks.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {telegramTestResult.checks.map((check) => (
              <p
                key={check.key}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs",
                  check.ok ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-rose-300/25 bg-rose-300/10 text-rose-100",
                )}
              >
                {check.key}: {check.message}
              </p>
            ))}
          </div>
        ) : null}

        <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-400">
          Real mass publish остаётся disabled. Этот блок не делает рассылку: только один выбранный канал и один выбранный пост.
        </p>

        {telegramAccess ? (
          <div className="mt-4 rounded-lg border border-line bg-slate-950/70 p-3">
            <div className="grid gap-3 md:grid-cols-5">
              <Metric label="Checked" value={telegramAccess.channelsTotal} tone="dry" />
              <Metric label="Accessible" value={telegramAccess.accessOk} tone={telegramAccess.accessOk === 15 ? "ok" : "warn"} />
              <Metric label="Bot admin" value={telegramAccess.botAdmin} tone={telegramAccess.botAdmin === 15 ? "ok" : "warn"} />
              <Metric label="Can post" value={telegramAccess.canPost} tone={telegramAccess.canPost === 15 ? "ok" : "warn"} />
              <Metric label="Errors" value={telegramAccess.checks.filter((check) => check.accessStatus !== "OK").length} tone={telegramAccess.ok ? "ok" : "error"} />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="border-b border-line px-3 py-2">channel name</th>
                    <th className="border-b border-line px-3 py-2">telegram target</th>
                    <th className="border-b border-line px-3 py-2">access status</th>
                    <th className="border-b border-line px-3 py-2">bot admin</th>
                    <th className="border-b border-line px-3 py-2">can post</th>
                    <th className="border-b border-line px-3 py-2">error</th>
                  </tr>
                </thead>
                <tbody>
                  {telegramAccess.checks.map((check) => (
                    <tr key={check.channelId} className="text-slate-300">
                      <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{check.channelName}</td>
                      <td className="border-b border-line/60 px-3 py-2">{check.telegramTarget || "target missing"}</td>
                      <td className={cn("border-b border-line/60 px-3 py-2", check.accessStatus === "OK" ? "text-emerald-100" : "text-rose-100")}>{check.accessStatus}</td>
                      <td className="border-b border-line/60 px-3 py-2">{check.botAdmin ? "yes" : "no"}</td>
                      <td className="border-b border-line/60 px-3 py-2">{check.canPost ? "yes" : "no"}</td>
                      <td className="border-b border-line/60 px-3 py-2 text-slate-400">{check.exactError ?? "none"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-emerald-300/20 bg-panel/70 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Batch test sandbox</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Результат теста 15 каналов</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Выбирается по одному ready_for_test посту с отдельной post image из каждого канала. Batch отправляет только в sandbox/test target и не использует настоящие Telegram-каналы.
            </p>
          </div>
          <button
            type="button"
            onClick={runBatchSandboxPublication}
            disabled={Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={cn("h-4 w-4", busy === "batch-sandbox" && "animate-pulse")} />
            Подготовить тест 15 каналов
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Metric label="Total channels" value={batchResult?.totalChannels ?? 15} tone="dry" />
          <Metric label="Selected posts" value={batchResult?.selectedTestPosts ?? 0} tone="dry" />
          <Metric label="Post images" value={batchResult?.postImages ?? 0} tone="ok" />
          <Metric label="Passed preflight" value={batchResult?.passedPreflight ?? 0} tone="ok" />
          <Metric label="Failed preflight" value={batchResult?.failedPreflight ?? 0} tone={(batchResult?.failedPreflight ?? 0) ? "error" : "ok"} />
          <Metric label="Dry-run success" value={batchResult?.dryRunSuccess ?? 0} tone="dry" />
          <Metric label="Errors" value={batchResult?.errors.length ?? 0} tone={(batchResult?.errors.length ?? 0) ? "error" : "ok"} />
          <Metric label="Real publish" value={0} tone="dry" />
        </div>

        {batchResult ? (
          <div className="mt-4 space-y-3">
            <div className="grid gap-2 text-xs md:grid-cols-5">
              <Info label="Mode" value={batchResult.mode} />
              <Info label="Telegram API called" value={batchResult.telegramApiCalled ? "yes" : "no"} danger={batchResult.telegramApiCalled} />
              <Info label="telegramSent" value={batchResult.telegramSent ? "true" : "false"} danger={batchResult.telegramSent} />
              <Info label="Real channels" value={batchResult.realChannelsUntouched ? "untouched" : "check"} danger={!batchResult.realChannelsUntouched} />
              <Info label="allowRealPublish" value={batchResult.allowRealPublish ? "true" : "false"} />
              <Info label="Can request unlock" value={batchResult.ok && batchResult.dryRunSuccess === 15 ? "yes" : "no"} />
            </div>

            {batchResult.errors.length ? (
              <div className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3">
                <p className="text-sm font-semibold text-rose-100">Preflight failed. Batch test was not started.</p>
                <div className="mt-2 grid gap-2">
                  {batchResult.errors.map((error) => (
                    <p key={`${error.channelId}-${error.postId ?? "missing"}`} className="text-xs leading-5 text-rose-100">
                      {error.channelName}: {error.postId ?? "no post"} — {error.issues.join(", ")}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                {batchResult.message}
              </p>
            )}

            <div className="grid gap-2 text-xs xl:grid-cols-3">
              {batchResult.payloads.map((payload) => (
                <div key={payload.sourceChannelId} className="rounded-md border border-line bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-100">{payload.sourceChannelName}</p>
                    <span className={cn("rounded border px-2 py-0.5", payload.issues.length ? "border-rose-300/30 text-rose-100" : "border-cyan-300/30 text-cyan-100")}>{payload.status}</span>
                  </div>
                  <p className="mt-2 truncate text-slate-400">{payload.postId}</p>
                  <p className="mt-1 truncate text-slate-500">{payload.imageUrl || "missing image"}</p>
                  {payload.issues.length ? <p className="mt-2 text-rose-100">{payload.issues.join(", ")}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-400">
            Batch test ещё не запускался. Реальная публикация остаётся disabled до отдельного allowRealPublish.
          </p>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        <Metric label="каналов" value={state?.counters.channelsTotal ?? 0} tone="dry" />
        <Metric label="ready_for_test" value={state?.counters.readyForTest ?? 0} tone="ok" />
        <Metric label="not_ready" value={state?.counters.notReady ?? 0} tone="warn" />
        <Metric label="invalid/currency" value={(state?.counters.postsWithInvalidChannelAssetImage ?? 0) + (state?.counters.postsWithForbiddenCurrency ?? 0)} tone={(state?.counters.postsWithInvalidChannelAssetImage ?? 0) + (state?.counters.postsWithForbiddenCurrency ?? 0) ? "error" : "ok"} />
        <Metric label="missing/broken" value={(state?.counters.postsWithoutImages ?? 0) + (state?.counters.postsWithBrokenImagePath ?? 0)} tone={(state?.counters.postsWithoutImages ?? 0) + (state?.counters.postsWithBrokenImagePath ?? 0) ? "error" : "ok"} />
        <Metric label="real sends" value={state?.counters.realSendsTotal ?? 0} tone="dry" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(state?.channels ?? []).map((channel) => {
          const tested = Boolean(testedChannels[channel.channelId]);
          const ready = channel.status === "ready_for_test";

          return (
            <article key={channel.channelId} className="rounded-lg border border-line bg-panel/70 p-4">
              <div className="flex flex-col gap-4 md:flex-row">
                  <div className="grid w-full grid-cols-3 gap-2 md:w-48">
                    <AssetImage src={channel.platformLogoUrl} label="platform logo" ok={channel.platformLogoStatus !== "missing"} />
                    <AssetImage src={channel.iconPath} label="icon.svg" ok={channel.iconOk} />
                    <AssetImage src={channel.previewPath} label="preview.svg" ok={channel.previewOk} wide />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={tested ? "ready_for_real_publish" : channel.status} />
                    <span className="rounded border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-[11px] text-slate-300">{channel.language}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{channel.channelTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{channel.description}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Тематика: {channel.topic}</p>
                  <div className="mt-4">
                    <ChannelLogoControl channelId={channel.channelId} compact />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs md:grid-cols-4">
                <Info label="Постов" value={String(channel.postsTotal)} />
                <Info label="With images" value={String(channel.postsWithImages)} />
                <Info label="Картинка поста" value={channel.postImageStatus} danger={channel.postImageStatus !== "OK"} />
                <Info label="Missing/Broken" value={`${channel.postsWithoutImages}/${channel.postsWithBrokenImagePath}`} danger={channel.postsWithoutImages + channel.postsWithBrokenImagePath > 0} />
                <Info label="Telegram avatar" value={channel.telegramAvatarLabel} />
                <Info label="Platform logo" value={`${channel.platformLogoSource} / ${channel.platformLogoStatus}`} danger={channel.platformLogoStatus === "missing"} />
                <Info label="Sample image path" value={channel.sampleImagePath || "missing"} danger={!channel.sampleFileExists} />
                <Info label="File exists" value={channel.sampleFileExists ? "yes" : "no"} danger={!channel.sampleFileExists} />
                <Info label="Ready/Not ready" value={`${channel.postsReadyForTest}/${channel.postsNotReady}`} danger={channel.postsNotReady > 0} />
                <Info label="Text" value={channel.brokenText + channel.failedGeneration === 0 ? "TEXT OK" : "BROKEN TEXT"} danger={channel.brokenText + channel.failedGeneration > 0} />
              </div>

              {channel.readinessReasons.length ? (
                <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                  {channel.readinessReasons.join("; ")}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadState}
                  disabled={Boolean(busy)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Проверить
                </button>
                <button
                  type="button"
                  onClick={() => testPublication(channel.channelId)}
                  disabled={!ready || Boolean(busy)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className={cn("h-3.5 w-3.5", busy === channel.channelId && "animate-pulse")} />
                  Тестовая публикация
                </button>
                <button
                  type="button"
                  disabled={!tested}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-slate-950 px-3 text-xs font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Реальная публикация
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <p className="rounded-lg border border-line bg-slate-950/60 p-4 text-sm text-slate-300">{message}</p>
    </div>
  );
}

function AssetImage({ src, label, ok, wide }: { src: string; label: string; ok: boolean; wide?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-md border bg-slate-950/70", ok ? "border-cyan-300/20" : "border-rose-300/30", wide && "col-span-3")}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={cn("w-full object-cover", wide ? "h-24" : "h-16")} />
      ) : (
        <div className={cn("flex items-center justify-center text-rose-200", wide ? "h-24" : "h-16")}>
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
      <p className="truncate px-2 py-1 text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold", tone === "ok" && "text-emerald-100", tone === "warn" && "text-amber-100", tone === "error" && "text-rose-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}

function BlockerMetric({ label, value, alwaysLocked, note }: { label: string; value: number; alwaysLocked?: boolean; note?: string }) {
  const tone = value > 0 ? (alwaysLocked ? "dry" : "error") : "ok";
  const status = note ?? (value > 0 ? (alwaysLocked ? "locked" : "blocked") : "OK");

  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold",
          tone === "ok" && "text-emerald-100",
          tone === "error" && "text-rose-100",
          tone === "dry" && "text-cyan-100",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{status}</p>
    </div>
  );
}

function StatusPill({ status }: { status: "ready_for_test" | "not_ready" | "ready_for_real_publish" }) {
  const tone = status === "ready_for_real_publish" ? "ok" : status === "ready_for_test" ? "dry" : "warn";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone === "ok" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        tone === "dry" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        tone === "warn" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
      )}
    >
      {status}
    </span>
  );
}

function Info({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 px-3 py-2">
      <p className={cn("font-semibold", danger ? "text-rose-100" : "text-slate-100")}>{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}


