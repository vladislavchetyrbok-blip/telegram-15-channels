"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Wand2 } from "lucide-react";
import type { ChannelEditorialProfile, EditorialValidationResult } from "@/types";
import { cn } from "@/lib/utils";

interface EditorialState {
  ok: boolean;
  profiles: ChannelEditorialProfile[];
  counters: {
    channelsTotal: number;
    profilesTotal: number;
    passed: number;
    needsRevision: number;
    realSent: number;
  };
}

interface TestResult {
  ok: boolean;
  text?: string;
  validation?: EditorialValidationResult;
  error?: string;
}

export function EditorialProfilesPanel() {
  const [state, setState] = useState<EditorialState | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfiles() {
      const response = await fetch("/api/editorial-profiles", { cache: "no-store" });
      const payload = (await response.json()) as EditorialState;
      setState(payload);
      setSelectedChannelId((current) => current || payload.profiles[0]?.channelId || "");
    }

    void loadProfiles();
  }, []);

  const selectedProfile = useMemo(
    () => state?.profiles.find((profile) => profile.channelId === selectedChannelId) ?? state?.profiles[0],
    [selectedChannelId, state?.profiles],
  );

  async function testGenerate() {
    if (!selectedProfile) {
      return;
    }

    try {
      setLoading(true);
      setTestResult(null);
      const response = await fetch(`/api/editorial-profiles/${selectedProfile.channelId}/test-generate`, {
        method: "POST",
      });
      const payload = (await response.json()) as TestResult;
      setTestResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Editorial guardrails</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Редакционные правила</h3>
            <p className="mt-1 text-sm text-slate-400">
              Dry-run: правила улучшают генерацию и проверку качества, но не отправляют сообщения в Telegram.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            <Counter label="каналов" value={state?.counters.channelsTotal ?? 15} />
            <Counter label="профилей" value={state?.counters.profilesTotal ?? 15} />
            <Counter label="прошли" value={state?.counters.passed ?? 0} />
            <Counter label="доработка" value={state?.counters.needsRevision ?? 0} />
            <Counter label="реальных" value={0} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-3">
          {state?.profiles.map((profile) => (
            <button
              key={profile.channelId}
              type="button"
              onClick={() => {
                setSelectedChannelId(profile.channelId);
                setTestResult(null);
              }}
              className={cn(
                "w-full rounded-lg border border-line bg-panel/70 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-900/80",
                selectedProfile?.channelId === profile.channelId && "border-cyan-300/50 bg-cyan-300/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{profile.channelTitle}</p>
                  <p className="mt-1 text-xs text-slate-500">{profile.tone}</p>
                </div>
                <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[11px] text-cyan-100">
                  {profile.language}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-panel/70 p-5">
          {selectedProfile ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Профиль канала</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedProfile.channelTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{selectedProfile.audience}</p>
                </div>
                <button
                  type="button"
                  onClick={testGenerate}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Wand2 className={cn("h-4 w-4", loading && "animate-spin")} />
                  {loading ? "Генерация..." : "Сгенерировать тест по правилам"}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Info title="Tone" items={[selectedProfile.tone]} />
                <Info title="Audience" items={[selectedProfile.audience]} />
                <Info title="Allowed post types" items={selectedProfile.allowedPostTypes} />
                <Info title="Content pillars" items={selectedProfile.contentPillars} />
                <Info title="Forbidden topics" items={selectedProfile.forbiddenTopics} />
                <Info title="Formatting rules" items={selectedProfile.formattingRules} />
              </div>

              <div className="rounded-md border border-line bg-slate-950/50 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-200" />
                  <p className="text-sm font-semibold text-white">Quality check</p>
                </div>
                {testResult ? (
                  <div className="mt-4 space-y-4">
                    <div
                      className={cn(
                        "rounded-md border p-3 text-sm",
                        testResult.validation?.ok
                          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                          : "border-amber-300/25 bg-amber-300/10 text-amber-100",
                      )}
                    >
                      {testResult.validation?.ok
                        ? "Проверка пройдена. Telegram не отправлялся."
                        : `Нужна доработка: ${testResult.validation?.reasons.join("; ") || testResult.error}`}
                    </div>
                    <textarea
                      readOnly
                      rows={14}
                      value={testResult.text ?? testResult.error ?? ""}
                      className="w-full rounded-md border border-line bg-[#090f1d] px-3 py-3 text-sm leading-6 text-white outline-none"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Нажмите кнопку генерации, чтобы проверить LM Studio текст по редакционным правилам.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center text-center text-sm text-slate-500">
              Профили загружаются.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/40 px-3 py-2 text-right">
      <p className="font-semibold text-white">{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-5 text-slate-300">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
