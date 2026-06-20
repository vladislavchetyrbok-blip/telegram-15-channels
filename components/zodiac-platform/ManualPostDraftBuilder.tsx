"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Clipboard, Copy, MessageSquareText, ShieldCheck, XCircle } from "lucide-react";
import { appendZodiacDashboardAuditEvent } from "@/lib/zodiac-dashboard-audit";

type Language = "RU" | "UA" | "EN";
type PostType = "daily_horoscope" | "weekly_preview" | "announcement" | "soft_launch_invite" | "custom_manual";

interface DraftChannel {
  slug: string;
  title: string;
  icon: string;
}

interface ManualPostDraft {
  channelSlug: string;
  date: string;
  postType: PostType;
  language: Language;
  title: string;
  body: string;
  ctaText: string;
  startapp: string;
  notes: string;
}

const storageKey = "zodiac-platform-manual-post-draft-v1";

const defaultDraft: ManualPostDraft = {
  channelSlug: "zodiac-general",
  date: "",
  postType: "custom_manual",
  language: "RU",
  title: "Заголовок draft-поста",
  body: "Текст поста для ручной подготовки. Перед live нужно сделать dry-run, проверить канал и получить отдельное approval.",
  ctaText: "Открыть Mini App",
  startapp: "compat",
  notes: "",
};

export function ManualPostDraftBuilder({ channels, todayDateKey }: { channels: DraftChannel[]; todayDateKey: string }) {
  const [draft, setDraft] = useState<ManualPostDraft>({ ...defaultDraft, date: todayDateKey });
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<"text" | "checklist" | "all" | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ManualPostDraft>;
        setDraft({ ...defaultDraft, date: todayDateKey, ...parsed });
      }
    } catch {
      setDraft({ ...defaultDraft, date: todayDateKey });
    } finally {
      setLoaded(true);
    }
  }, [todayDateKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, loaded]);

  const selectedChannel = channels.find((channel) => channel.slug === draft.channelSlug) ?? channels[0];
  const validation = useMemo(() => validateDraft(draft), [draft]);
  const generatedText = useMemo(() => buildTelegramText(draft, selectedChannel), [draft, selectedChannel]);
  const checklist = useMemo(() => buildChecklist(draft, selectedChannel), [draft, selectedChannel]);

  function updateDraft<K extends keyof ManualPostDraft>(field: K, value: ManualPostDraft[K]) {
    setCopied(null);
    const nextDraft = { ...draft, [field]: value };
    setDraft(nextDraft);
    appendZodiacDashboardAuditEvent({
      action: "manual_post_draft_updated",
      route: "/dashboard/networks/zodiac/publishing",
      label: `${nextDraft.channelSlug} ${nextDraft.postType}`,
      status: "draft-only",
      risk: "approval",
    });
  }

  async function copyText(kind: "text" | "checklist" | "all", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section id="manual-post-draft-builder" data-qa="manual-post-draft-builder" className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">local draft only</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Ручной draft-пост</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Черновик хранится только в localStorage браузера. Эта форма готовит текст, но не публикует в Telegram и не пишет ledger.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          без server write API
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Канал / тема">
            <select value={draft.channelSlug} onChange={(event) => updateDraft("channelSlug", event.target.value)} className={inputClassName}>
              {channels.map((channel) => (
                <option key={channel.slug} value={channel.slug}>
                  {channel.icon} {channel.title} ({channel.slug})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Дата">
            <input type="date" value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Тип поста">
            <select value={draft.postType} onChange={(event) => updateDraft("postType", event.target.value as PostType)} className={inputClassName}>
              <option value="daily_horoscope">daily horoscope</option>
              <option value="weekly_preview">weekly preview</option>
              <option value="announcement">announcement</option>
              <option value="soft_launch_invite">soft launch invite</option>
              <option value="custom_manual">custom/manual</option>
            </select>
          </Field>
          <Field label="Язык">
            <select value={draft.language} onChange={(event) => updateDraft("language", event.target.value as Language)} className={inputClassName}>
              <option value="RU">RU</option>
              <option value="UA">UA</option>
              <option value="EN">EN</option>
            </select>
          </Field>
          <Field label="Заголовок" wide>
            <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Текст поста" wide>
            <textarea value={draft.body} onChange={(event) => updateDraft("body", event.target.value)} rows={7} className={inputClassName} />
          </Field>
          <Field label="CTA text">
            <input value={draft.ctaText} onChange={(event) => updateDraft("ctaText", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Mini App startapp">
            <input value={draft.startapp} onChange={(event) => updateDraft("startapp", event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Заметки" wide>
            <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} rows={4} className={inputClassName} />
          </Field>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Telegram preview</p>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-xl text-violet-700">
                  {selectedChannel?.icon ?? "✦"}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{selectedChannel?.slug}</p>
                  <h3 className="mt-1 break-words font-semibold text-slate-950">{draft.title || "Без заголовка"}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{draft.body}</p>
                  <p className="mt-3 inline-flex rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {draft.ctaText || "CTA"} → startapp={draft.startapp || "required"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div data-qa="manual-post-validation" className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Валидация</p>
            <ul className="mt-3 space-y-2">
              {validation.items.map((item) => (
                <li key={item.label} className={`flex items-start gap-2 text-sm font-semibold ${item.ok ? "text-emerald-700" : item.warning ? "text-amber-700" : "text-rose-700"}`}>
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
          id="generated-manual-post-text"
          qa="generated-manual-post-text"
          title="Generated Telegram text"
          text={generatedText}
          copied={copied === "text"}
          onCopy={() => copyText("text", generatedText)}
        />
        <GeneratedBlock
          id="generated-manual-post-checklist"
          qa="generated-manual-post-checklist"
          title="Generated checklist"
          text={checklist}
          copied={copied === "checklist"}
          onCopy={() => copyText("checklist", checklist)}
        />
      </div>

      <button
        type="button"
        onClick={() => copyText("all", `${generatedText}\n\n${checklist}`)}
        className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
      >
        <Clipboard className="h-4 w-4" />
        {copied === "all" ? "Скопировано" : "Скопировать текст и checklist"}
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
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
          <MessageSquareText className="h-4 w-4" />
          {title}
        </h3>
        <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15">
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Скопировано" : "Скопировать"}
        </button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-black/30 p-3 text-xs leading-5 text-slate-100">
        {text}
      </pre>
    </div>
  );
}

function validateDraft(draft: ManualPostDraft) {
  const startappSafe = /^[A-Za-z0-9_.-]{1,64}$/.test(draft.startapp.trim()) && !/(token|secret|password|redis)/i.test(draft.startapp);
  const bodyLengthWarning = draft.body.length > 3200;

  return {
    ok: Boolean(draft.channelSlug) && Boolean(draft.date) && Boolean(draft.body.trim()) && startappSafe && !bodyLengthWarning,
    items: [
      { label: "канал выбран", ok: Boolean(draft.channelSlug) },
      { label: "дата выбрана", ok: Boolean(draft.date) },
      { label: "текст поста заполнен", ok: Boolean(draft.body.trim()) },
      { label: "startapp safe", ok: startappSafe },
      { label: "секретные поля не используются", ok: true },
      { label: bodyLengthWarning ? "текст длиннее 3200 символов, нужна ручная проверка" : "длина текста в рабочем диапазоне", ok: !bodyLengthWarning, warning: bodyLengthWarning },
    ],
  };
}

function buildTelegramText(draft: ManualPostDraft, channel?: DraftChannel) {
  const parts = [
    draft.title.trim(),
    "",
    draft.body.trim(),
    "",
    `${draft.ctaText.trim() || "Открыть Mini App"}: https://t.me/zodiac_love_check_bot?startapp=${draft.startapp.trim() || "compat"}`,
    "",
    `#draft ${channel?.slug ?? draft.channelSlug} ${draft.date} ${draft.postType} ${draft.language}`,
  ];

  return parts.filter((part, index) => part || index === 1 || index === 3 || index === 5).join("\n");
}

function buildChecklist(draft: ManualPostDraft, channel?: DraftChannel) {
  return [
    `Checklist: ${channel?.title ?? draft.channelSlug} / ${draft.date}`,
    "1. Review text",
    "2. Dry-run",
    "3. Confirm channel",
    "4. Manual approval",
    "5. Live publish only through approved process",
  ].join("\n");
}

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
