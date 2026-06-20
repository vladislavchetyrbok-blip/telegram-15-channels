"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Clipboard, Copy, MessageSquareText, ShieldCheck, XCircle } from "lucide-react";
import {
  zodiacContentQualityItems,
  zodiacContentQualityStorageKey,
  zodiacContentTemplateStorageKey,
  type ZodiacContentLanguage,
  type ZodiacContentTemplateCatalogItem,
} from "@/lib/zodiac-platform-content";

type Tone = "мистический" | "спокойный" | "продающий" | "премиальный" | "короткий" | "дружеский";
type EmojiIntensity = "none" | "low" | "medium";
type DraftStatus = "draft" | "ready" | "needs review";
type ContentValidationRisk = "safe" | "review" | "blocked";
type QualityState = Record<string, boolean>;

interface TemplateStudioChannel {
  slug: string;
  title: string;
  icon: string;
}

interface TemplateStudioDraft {
  templateId: string;
  language: ZodiacContentLanguage;
  channelTopic: string;
  tone: Tone;
  title: string;
  body: string;
  ctaText: string;
  startapp: string;
  emojiIntensity: EmojiIntensity;
  status: DraftStatus;
  notes: string;
}

const defaultDraft: TemplateStudioDraft = {
  templateId: "daily-horoscope",
  language: "RU",
  channelTopic: "zodiac-general",
  tone: "спокойный",
  title: "Гороскоп дня",
  body: "Сегодня выберите один спокойный фокус и проверьте, куда ведёт энергия дня. Это символический прогноз без точных астрологических расчётов.",
  ctaText: "Открыть Mini App",
  startapp: "compat",
  emojiIntensity: "low",
  status: "draft",
  notes: "",
};

const toneOptions: Tone[] = ["мистический", "спокойный", "продающий", "премиальный", "короткий", "дружеский"];
const languages: ZodiacContentLanguage[] = ["RU", "UA", "EN"];
const emojiIntensities: EmojiIntensity[] = ["none", "low", "medium"];
const statuses: DraftStatus[] = ["draft", "ready", "needs review"];

export function ContentTemplateStudio({ templates, channels }: { templates: ZodiacContentTemplateCatalogItem[]; channels: TemplateStudioChannel[] }) {
  const [draft, setDraft] = useState<TemplateStudioDraft>(defaultDraft);
  const [qualityState, setQualityState] = useState<QualityState>({});
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<"text" | "config" | "checklist" | "all" | null>(null);

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(zodiacContentTemplateStorageKey);
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft) as Partial<TemplateStudioDraft>;
        setDraft(sanitizeDraft({ ...defaultDraft, ...parsed }));
      }

      const storedQuality = window.localStorage.getItem(zodiacContentQualityStorageKey);
      if (storedQuality) {
        const parsedQuality = JSON.parse(storedQuality) as QualityState;
        setQualityState(parsedQuality && typeof parsedQuality === "object" ? parsedQuality : {});
      }
    } catch {
      setDraft(defaultDraft);
      setQualityState({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(zodiacContentTemplateStorageKey, JSON.stringify(sanitizeDraft(draft)));
  }, [draft, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(zodiacContentQualityStorageKey, JSON.stringify(qualityState));
  }, [qualityState, loaded]);

  const selectedTemplate = templates.find((template) => template.id === draft.templateId) ?? templates[0];
  const selectedChannel = channels.find((channel) => channel.slug === draft.channelTopic) ?? channels[0];
  const validation = useMemo(() => validateContentDraft(draft), [draft]);
  const generatedText = useMemo(() => buildGeneratedText(draft, selectedTemplate), [draft, selectedTemplate]);
  const generatedConfig = useMemo(() => buildGeneratedConfig(draft, selectedTemplate, selectedChannel), [draft, selectedTemplate, selectedChannel]);
  const generatedChecklist = useMemo(() => buildGeneratedChecklist(), []);
  const checkedQualityCount = zodiacContentQualityItems.filter((item) => qualityState[item.id]).length;

  function updateDraft<K extends keyof TemplateStudioDraft>(field: K, value: TemplateStudioDraft[K]) {
    setCopied(null);
    setDraft((current) => sanitizeDraft({ ...current, [field]: value }));
  }

  function updateTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    setCopied(null);
    setDraft((current) =>
      sanitizeDraft({
        ...current,
        templateId,
        channelTopic: template?.recommendedChannel.includes("sign") ? "aries" : "zodiac-general",
        startapp: template?.startapp ?? current.startapp,
        ctaText: template?.ctaTarget ?? current.ctaText,
        status: template?.status === "ready" ? "ready" : current.status,
      }),
    );
  }

  function updateQualityItem(id: string, checked: boolean) {
    setQualityState((current) => ({ ...current, [id]: checked }));
  }

  async function copyText(kind: "text" | "config" | "checklist" | "all", value: string) {
    if (!validation.canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="space-y-6">
      <section id="template-studio" data-qa="template-studio" className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">localStorage only</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Template Studio</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Безопасная подготовка Telegram-текста: локальный черновик, preview и copy. Нет server writes, Telegram API calls, live publish или ledger writes.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            no server write API
          </span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Template type">
              <select value={draft.templateId} onChange={(event) => updateTemplate(event.target.value)} className={inputClassName}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Language">
              <select value={draft.language} onChange={(event) => updateDraft("language", event.target.value as ZodiacContentLanguage)} className={inputClassName}>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Channel/topic">
              <select value={draft.channelTopic} onChange={(event) => updateDraft("channelTopic", event.target.value)} className={inputClassName}>
                {channels.map((channel) => (
                  <option key={channel.slug} value={channel.slug}>
                    {channel.icon} {channel.title} ({channel.slug})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tone">
              <select value={draft.tone} onChange={(event) => updateDraft("tone", event.target.value as Tone)} className={inputClassName}>
                {toneOptions.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title" wide>
              <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Body" wide>
              <textarea value={draft.body} onChange={(event) => updateDraft("body", event.target.value)} rows={7} className={inputClassName} />
            </Field>
            <Field label="CTA text">
              <input value={draft.ctaText} onChange={(event) => updateDraft("ctaText", event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Mini App startapp parameter">
              <input value={draft.startapp} onChange={(event) => updateDraft("startapp", event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Emoji intensity">
              <select value={draft.emojiIntensity} onChange={(event) => updateDraft("emojiIntensity", event.target.value as EmojiIntensity)} className={inputClassName}>
                {emojiIntensities.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={(event) => updateDraft("status", event.target.value as DraftStatus)} className={inputClassName}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notes" wide>
              <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} rows={4} className={inputClassName} />
            </Field>
          </div>

          <div className="space-y-4">
            <div data-qa="telegram-post-preview" className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Telegram preview</p>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-xl text-violet-700">
                    {selectedChannel?.icon ?? "✦"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{selectedChannel?.slug ?? draft.channelTopic}</p>
                    <h3 className="mt-1 break-words font-semibold text-slate-950">{draft.title || "Без заголовка"}</h3>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{draft.body || "Body required"}</p>
                    <p className="mt-3 inline-flex rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      {draft.ctaText || "CTA missing"} → startapp={draft.startapp || "required"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div data-qa="compact-channel-card-preview" className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Compact channel card preview</p>
              <div className="mt-3 flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{selectedChannel?.icon} {selectedChannel?.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{selectedTemplate?.name} · {draft.language} · {draft.status}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[validation.risk]}`}>{validation.risk}</span>
              </div>
            </div>

            <div data-qa="content-template-validation" className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Validation</p>
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

        <div className="grid gap-4 lg:grid-cols-3">
          <GeneratedBlock
            id="generated-content-text"
            qa="generated-content-text"
            title="Generated text"
            text={generatedText}
            copied={copied === "text"}
            disabled={!validation.canCopy}
            onCopy={() => copyText("text", generatedText)}
          />
          <GeneratedBlock
            id="generated-content-config"
            qa="generated-content-config"
            title="Generated config/snippet"
            text={generatedConfig}
            copied={copied === "config"}
            disabled={!validation.canCopy}
            onCopy={() => copyText("config", generatedConfig)}
          />
          <GeneratedBlock
            id="generated-content-checklist"
            qa="generated-content-checklist"
            title="Generated checklist"
            text={generatedChecklist}
            copied={copied === "checklist"}
            disabled={!validation.canCopy}
            onCopy={() => copyText("checklist", generatedChecklist)}
          />
        </div>

        <button
          type="button"
          disabled={!validation.canCopy}
          onClick={() => copyText("all", `${generatedText}\n\n${generatedConfig}\n\n${generatedChecklist}`)}
          className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <Clipboard className="h-4 w-4" />
          {copied === "all" ? "Скопировано" : "Скопировать текст, config и checklist"}
        </button>
      </section>

      <section data-qa="content-quality-checklist" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">localStorage only</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Проверка качества текста</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Локальный чеклист редактора для RU/UA/EN текста. Не отправляется на сервер и не меняет публикации.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
            {checkedQualityCount}/{zodiacContentQualityItems.length}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {zodiacContentQualityItems.map((item) => (
            <label key={item.id} className="flex min-h-12 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(qualityState[item.id])}
                onChange={(event) => updateQualityItem(item.id, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
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
  disabled,
  onCopy,
}: {
  id: string;
  qa: string;
  title: string;
  text: string;
  copied: boolean;
  disabled: boolean;
  onCopy: () => void;
}) {
  return (
    <div id={id} data-qa={qa} className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
          <MessageSquareText className="h-4 w-4" />
          {title}
        </h3>
        <button
          type="button"
          disabled={disabled}
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
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

function sanitizeDraft(draft: TemplateStudioDraft): TemplateStudioDraft {
  return {
    ...draft,
    templateId: sanitizeToken(draft.templateId, defaultDraft.templateId),
    language: languages.includes(draft.language) ? draft.language : "RU",
    channelTopic: sanitizeToken(draft.channelTopic, defaultDraft.channelTopic),
    tone: toneOptions.includes(draft.tone) ? draft.tone : "спокойный",
    title: sanitizeDraftText(draft.title, 120),
    body: sanitizeDraftText(draft.body, 1800),
    ctaText: sanitizeDraftText(draft.ctaText, 80),
    startapp: sanitizeToken(draft.startapp, "compat"),
    emojiIntensity: emojiIntensities.includes(draft.emojiIntensity) ? draft.emojiIntensity : "low",
    status: statuses.includes(draft.status) ? draft.status : "draft",
    notes: sanitizeDraftText(draft.notes, 500),
  };
}

function validateContentDraft(draft: TemplateStudioDraft) {
  const combinedText = `${draft.title}\n${draft.body}\n${draft.ctaText}\n${draft.notes}`;
  const startappSafe = /^[A-Za-z0-9_.-]{1,64}$/.test(draft.startapp) && !/(token|secret|password|redis|initData)/i.test(draft.startapp);
  const hasSecrets = secretPattern.test(combinedText);
  const hasSensitive = sensitivePatterns.some((pattern) => pattern.test(combinedText));
  const hasExactClaim = exactClaimPatterns.some((pattern) => pattern.test(combinedText));
  const mixedLanguage = detectMixedLanguage(draft.language, combinedText);
  const tooLong = draft.body.length > 1200;
  const ctaMissing = draft.ctaText.trim().length === 0;

  for (const pattern of [...sensitivePatterns, ...exactClaimPatterns, secretPattern]) pattern.lastIndex = 0;

  const canCopy = Boolean(draft.title.trim()) && Boolean(draft.body.trim()) && startappSafe && !hasSecrets && !hasSensitive && !hasExactClaim;
  const risk: ContentValidationRisk = !canCopy ? "blocked" : mixedLanguage || tooLong || ctaMissing ? "review" : "safe";

  return {
    canCopy,
    risk,
    items: [
      { label: "title required", ok: Boolean(draft.title.trim()) },
      { label: "body required", ok: Boolean(draft.body.trim()) },
      { label: "language selected", ok: languages.includes(draft.language) },
      { label: "startapp param safe", ok: startappSafe },
      { label: "no token/secret fields", ok: !hasSecrets },
      { label: "no raw personal data", ok: !hasSensitive },
      { label: "no exact astro claims; symbolic only / exact_unavailable", ok: !hasExactClaim },
      { label: mixedLanguage ? "warning: possible mixed RU/UA/EN text" : "language mix check passed", ok: !mixedLanguage, warning: mixedLanguage },
      { label: tooLong ? "warning: text is long for Telegram readability" : "Telegram readability length OK", ok: !tooLong, warning: tooLong },
      { label: ctaMissing ? "warning: CTA missing" : "CTA present", ok: !ctaMissing, warning: ctaMissing },
    ],
  };
}

function buildGeneratedText(draft: TemplateStudioDraft, template?: ZodiacContentTemplateCatalogItem) {
  const emoji = draft.emojiIntensity === "medium" ? "✨ " : draft.emojiIntensity === "low" ? "• " : "";
  const parts = [
    `${emoji}${draft.title.trim()}`,
    "",
    draft.body.trim(),
    "",
    `${draft.ctaText.trim() || "Открыть Mini App"}: https://t.me/zodiac_love_check_bot?startapp=${draft.startapp || "compat"}`,
    "",
    `#draft ${template?.id ?? draft.templateId} ${draft.channelTopic} ${draft.language} ${draft.status}`,
  ];

  return parts.filter((part, index) => part || index === 1 || index === 3 || index === 5).join("\n");
}

function buildGeneratedConfig(draft: TemplateStudioDraft, template?: ZodiacContentTemplateCatalogItem, channel?: TemplateStudioChannel) {
  return JSON.stringify(
    {
      templateId: template?.id ?? draft.templateId,
      templateName: template?.name ?? draft.templateId,
      language: draft.language,
      channelSlug: channel?.slug ?? draft.channelTopic,
      tone: draft.tone,
      ctaText: draft.ctaText,
      startapp: draft.startapp,
      emojiIntensity: draft.emojiIntensity,
      status: draft.status,
      safety: {
        storage: "localStorage only",
        livePublish: false,
        serverWriteApi: false,
        exactAstro: "symbolic only / exact_unavailable",
      },
    },
    null,
    2,
  );
}

function buildGeneratedChecklist() {
  return [
    "Checklist:",
    "1. review language",
    "2. review CTA",
    "3. dry-run",
    "4. manual approval",
    "5. publish only through approved process",
  ].join("\n");
}

function sanitizeDraftText(value: string, maxLength: number) {
  let text = String(value ?? "");
  for (const pattern of sensitiveReplacements) {
    text = text.replace(pattern.regex, pattern.replacement);
  }
  return text.replace(/\s{3,}/g, "  ").slice(0, maxLength);
}

function sanitizeToken(value: string, fallback: string) {
  const token = String(value ?? "").trim().replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 64);
  return token && !/(token|secret|password|redis|initData)/i.test(token) ? token : fallback;
}

function detectMixedLanguage(language: ZodiacContentLanguage, text: string) {
  const hasCyrillic = /[А-Яа-яЁёІіЇїЄєҐґ]/.test(text);
  const hasUkrainian = /[ІіЇїЄєҐґ]/.test(text);
  const hasLatinWords = /\b[A-Za-z]{4,}\b/.test(text);

  if (language === "EN") return hasCyrillic;
  if (language === "RU") return hasUkrainian;
  if (language === "UA") return hasLatinWords && !hasCyrillic;
  return false;
}

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

const riskClasses: Record<ContentValidationRisk, string> = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  review: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
};

const secretPattern = /\b(?:bot[_-]?token|token|secret|password|redis|initData)\s*[:=]\s*[^\s,;]+/gi;

const sensitivePatterns = [
  /(?:\+?\d[\s().-]?){8,}\d/g,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g,
  /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g,
  /\b(?:birth date|birth time|city|question|intention|result text|дата рождения|время рождения|город|вопрос|намерение|текст результата)\s*[:=]\s*[^,\n;]+/gi,
];

const exactClaimPatterns = [
  /точн\w*.{0,30}(асцендент|планет|дом|натальн)/gi,
  /(рассчит\w*.{0,30}(асцендент|планет|дом))/gi,
  /\b(?:ephemeris|NASA|geocode|house system|ascendant calculated)\b/gi,
];

const sensitiveReplacements = [
  { regex: secretPattern, replacement: "[redacted-secret]" },
  { regex: /(?:\+?\d[\s().-]?){8,}\d/g, replacement: "[redacted-phone]" },
  { regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: "[redacted-email]" },
  { regex: /\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g, replacement: "[redacted-date]" },
  { regex: /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g, replacement: "[redacted-time]" },
  { regex: /\b(?:birth date|birth time|city|question|intention|result text|дата рождения|время рождения|город|вопрос|намерение|текст результата)\s*[:=]\s*[^,\n;]+/gi, replacement: "[redacted-private-field]" },
];
