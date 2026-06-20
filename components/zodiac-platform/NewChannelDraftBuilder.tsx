"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Clipboard, Copy, ShieldCheck, XCircle } from "lucide-react";
import { appendZodiacDashboardAuditEvent } from "@/lib/zodiac-dashboard-audit";

type Language = "RU" | "UA" | "EN";
type Cadence = "daily" | "weekly" | "manual";
type DraftStatus = "draft" | "ready";

interface ChannelDraft {
  title: string;
  slug: string;
  language: Language;
  category: string;
  handleOrUrl: string;
  icon: string;
  description: string;
  startapp: string;
  cadence: Cadence;
  status: DraftStatus;
  notes: string;
}

const storageKey = "zodiac-platform-new-channel-draft-v1";

const defaultDraft: ChannelDraft = {
  title: "Новый канал",
  slug: "new-channel",
  language: "RU",
  category: "zodiac",
  handleOrUrl: "",
  icon: "✦",
  description: "Короткое описание канала для Telegram и внутреннего реестра.",
  startapp: "compat_new_channel",
  cadence: "daily",
  status: "draft",
  notes: "",
};

export function NewChannelDraftBuilder({ existingSlugs }: { existingSlugs: string[] }) {
  const [draft, setDraft] = useState<ChannelDraft>(defaultDraft);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<"config" | "checklist" | "all" | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ChannelDraft>;
        setDraft({ ...defaultDraft, ...parsed, status: parsed.status === "ready" ? "ready" : "draft" });
      }
    } catch {
      setDraft(defaultDraft);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, loaded]);

  const normalizedSlugs = useMemo(() => new Set(existingSlugs.map((slug) => slug.toLowerCase())), [existingSlugs]);
  const validation = useMemo(() => validateDraft(draft, normalizedSlugs), [draft, normalizedSlugs]);
  const generatedConfig = useMemo(() => buildGeneratedConfig(draft), [draft]);
  const generatedChecklist = useMemo(() => buildGeneratedChecklist(draft), [draft]);

  function updateDraft<K extends keyof ChannelDraft>(field: K, value: ChannelDraft[K]) {
    setCopied(null);
    const nextDraft = { ...draft, [field]: value };
    setDraft(nextDraft);
    appendZodiacDashboardAuditEvent({
      action: "channel_draft_updated",
      route: "/dashboard/networks/zodiac/channels",
      label: nextDraft.slug || nextDraft.title || "new channel draft",
      status: nextDraft.status,
      risk: "approval",
    });
  }

  async function copyText(kind: "config" | "checklist" | "all", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section id="new-channel-draft-builder" data-qa="new-channel-draft-builder" className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">local draft only</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Добавить новый канал</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Черновик хранится в localStorage этого браузера. Здесь нет live API, записи в ledger и полей для секретов.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          безопасный черновик
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Название канала">
            <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Slug">
            <input value={draft.slug} onChange={(event) => updateDraft("slug", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Язык">
            <select value={draft.language} onChange={(event) => updateDraft("language", event.target.value as Language)} className={inputClassName}>
              <option value="RU">RU</option>
              <option value="UA">UA</option>
              <option value="EN">EN</option>
            </select>
          </Field>
          <Field label="Категория / тема">
            <input value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Telegram handle или URL">
            <input value={draft.handleOrUrl} onChange={(event) => updateDraft("handleOrUrl", event.target.value)} placeholder="@channel_name или https://t.me/channel_name" className={inputClassName} />
          </Field>
          <Field label="Emoji / icon">
            <input value={draft.icon} onChange={(event) => updateDraft("icon", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Mini App startapp">
            <input value={draft.startapp} onChange={(event) => updateDraft("startapp", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Каденс публикаций">
            <select value={draft.cadence} onChange={(event) => updateDraft("cadence", event.target.value as Cadence)} className={inputClassName}>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="manual">manual</option>
            </select>
          </Field>
          <Field label="Статус">
            <select value={draft.status} onChange={(event) => updateDraft("status", event.target.value as DraftStatus)} className={inputClassName}>
              <option value="draft">draft</option>
              <option value="ready">ready</option>
            </select>
          </Field>
          <Field label="Описание" wide>
            <textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} rows={4} className={inputClassName} />
          </Field>
          <Field label="Заметки" wide>
            <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} rows={4} className={inputClassName} />
          </Field>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">preview</p>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-xl text-violet-700">
                  {draft.icon || "✦"}
                </span>
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-slate-950">{draft.title || "Без названия"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{draft.slug || "slug-required"} · {draft.language} · {draft.cadence}</p>
                  <p className="mt-2 break-words text-sm leading-6 text-slate-600">{draft.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div id="channel-draft-validation" data-qa="channel-draft-validation" className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Валидация</p>
            <ul className="mt-3 space-y-2">
              {validation.items.map((item) => (
                <li key={item.label} className={`flex items-start gap-2 text-sm font-semibold ${item.ok ? "text-emerald-700" : "text-rose-700"}`}>
                  {item.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GeneratedBlock
          id="generated-channel-config"
          qa="generated-channel-config"
          title="Generated config JSON"
          text={generatedConfig}
          copied={copied === "config"}
          onCopy={() => copyText("config", generatedConfig)}
        />
        <GeneratedBlock
          id="generated-channel-checklist"
          qa="generated-channel-checklist"
          title="Generated checklist"
          text={generatedChecklist}
          copied={copied === "checklist"}
          onCopy={() => copyText("checklist", generatedChecklist)}
        />
      </div>

      <button
        type="button"
        onClick={() => copyText("all", `${generatedConfig}\n\n${generatedChecklist}`)}
        className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
      >
        <Clipboard className="h-4 w-4" />
        {copied === "all" ? "Скопировано" : "Скопировать config и checklist"}
      </button>
    </section>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-slate-700 ${wide ? "md:col-span-2" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function GeneratedBlock({
  id,
  qa,
  title,
  text,
  copied,
  onCopy,
}: {
  id: string;
  qa: string;
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div id={id} data-qa={qa} className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15">
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Скопировано" : "Copy"}
        </button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-black/30 p-3 text-xs leading-5 text-slate-100">
        {text}
      </pre>
    </div>
  );
}

function validateDraft(draft: ChannelDraft, existingSlugs: Set<string>) {
  const slug = draft.slug.trim();
  const handle = draft.handleOrUrl.trim();
  const startapp = draft.startapp.trim();
  const safeStartapp = /^[A-Za-z0-9_.-]{1,64}$/.test(startapp) && !/(token|secret|password|redis)/i.test(startapp);

  return {
    ok:
      Boolean(slug) &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
      !existingSlugs.has(slug.toLowerCase()) &&
      Boolean(draft.language) &&
      (!handle || /^@[A-Za-z0-9_]{5,32}$/.test(handle) || /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}\/?$/.test(handle)) &&
      safeStartapp,
    items: [
      { label: "slug заполнен", ok: Boolean(slug) },
      { label: "slug lowercase/url-safe", ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) },
      { label: "slug не дублирует существующий канал", ok: Boolean(slug) && !existingSlugs.has(slug.toLowerCase()) },
      { label: "язык выбран", ok: Boolean(draft.language) },
      { label: "Telegram handle/URL выглядит корректно", ok: !handle || /^@[A-Za-z0-9_]{5,32}$/.test(handle) || /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}\/?$/.test(handle) },
      { label: "startapp safe", ok: safeStartapp },
      { label: "секретные поля не используются", ok: true },
    ],
  };
}

function buildGeneratedConfig(draft: ChannelDraft) {
  const config = {
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    language: draft.language,
    category: draft.category.trim(),
    telegram: {
      handleOrUrl: draft.handleOrUrl.trim() || null,
    },
    icon: draft.icon.trim(),
    description: draft.description.trim(),
    miniAppStartapp: draft.startapp.trim(),
    publishingCadence: draft.cadence,
    status: draft.status,
    notes: draft.notes.trim(),
  };

  return JSON.stringify(config, null, 2);
}

function buildGeneratedChecklist(draft: ChannelDraft) {
  const title = draft.title.trim() || "новый канал";

  return [
    `Checklist for ${title}`,
    "1. Create Telegram channel",
    "2. Add bot/admin",
    "3. Add channel to registry",
    "4. Dry-run navigation",
    "5. Dry-run description",
    "6. Dry-run publishing",
    "7. Approve live manually",
  ].join("\n");
}

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
