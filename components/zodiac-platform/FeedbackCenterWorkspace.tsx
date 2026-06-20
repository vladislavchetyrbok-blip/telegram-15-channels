"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, Copy, Database, HeartHandshake, ListChecks, MessageSquareText, Phone, ShieldCheck, Target, UsersRound, XCircle } from "lucide-react";
import { appendZodiacDashboardAuditEvent } from "@/lib/zodiac-dashboard-audit";

type Device = "iphone" | "android" | "desktop" | "unknown";
type TelegramApp = "ios" | "android" | "desktop" | "unknown";
type WouldShare = "yes" | "no" | "unknown";
type Severity = "" | "P0" | "P1" | "P2" | "Backlog" | "Positive";
type FeedbackStatus = "New" | "Accepted" | "Fixed" | "Deferred";

interface FeedbackFormState {
  testerLabel: string;
  device: Device;
  telegramApp: TelegramApp;
  rating: string;
  strongestFeature: string;
  confusing: string;
  broke: string;
  wouldShare: WouldShare;
  severity: Severity;
  status: FeedbackStatus;
  sanitizedNote: string;
}

interface FeedbackEntry {
  id: string;
  createdAt: string;
  testerLabel: string;
  device: Device;
  telegramApp: TelegramApp;
  rating: number | null;
  strongestFeature: string;
  confusing: string;
  broke: string;
  wouldShare: WouldShare;
  severity: Exclude<Severity, "">;
  status: FeedbackStatus;
  sanitizedNote: string;
}

type QaState = Record<string, boolean>;

const feedbackStorageKey = "zodiac-platform-feedback-center-v1";
const realPhoneQaStorageKey = "zodiac-platform-real-phone-qa-v1";

const defaultForm: FeedbackFormState = {
  testerLabel: "Tester 1",
  device: "unknown",
  telegramApp: "unknown",
  rating: "",
  strongestFeature: "",
  confusing: "",
  broke: "",
  wouldShare: "unknown",
  severity: "",
  status: "New",
  sanitizedNote: "",
};

const qaItems = [
  { id: "iphone-open", label: "iPhone Telegram opens Mini App" },
  { id: "android-open", label: "Android Telegram opens Mini App" },
  { id: "back-button", label: "BackButton works" },
  { id: "bottom-buttons", label: "bottom buttons not overlapped" },
  { id: "keyboard", label: "keyboard does not cover form" },
  { id: "share", label: "share works" },
  { id: "save-history", label: "save/history works" },
  { id: "feedback-opens", label: "feedback opens" },
  { id: "theme-readable", label: "dark/light theme readable" },
  { id: "no-white-screen", label: "no white screen" },
];

export function FeedbackCenterWorkspace() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [qaState, setQaState] = useState<QaState>({});
  const [form, setForm] = useState<FeedbackFormState>(defaultForm);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const storedEntries = window.localStorage.getItem(feedbackStorageKey);
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries) as FeedbackEntry[];
        setEntries(Array.isArray(parsedEntries) ? parsedEntries.map(sanitizeLoadedEntry).filter(isFeedbackEntry) : []);
      }

      const storedQa = window.localStorage.getItem(realPhoneQaStorageKey);
      if (storedQa) {
        const parsedQa = JSON.parse(storedQa) as QaState;
        setQaState(parsedQa && typeof parsedQa === "object" ? parsedQa : {});
      }
    } catch {
      setEntries([]);
      setQaState({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(feedbackStorageKey, JSON.stringify(entries));
  }, [entries, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(realPhoneQaStorageKey, JSON.stringify(qaState));
  }, [qaState, loaded]);

  const validation = useMemo(() => validateFeedbackForm(form), [form]);
  const summary = useMemo(() => buildFeedbackSummary(entries), [entries]);
  const triage = useMemo(() => buildTriageSummary(entries), [entries]);
  const qaDoneCount = qaItems.filter((item) => qaState[item.id]).length;
  const exportText = useMemo(() => buildSanitizedExport(entries, qaState, summary.recommendedNextAction), [entries, qaState, summary.recommendedNextAction]);

  function updateForm<K extends keyof FeedbackFormState>(field: K, value: FeedbackFormState[K]) {
    setCopied(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addFeedbackEntry() {
    if (!validation.canSave) return;

    const nextEntry = buildFeedbackEntry(form, entries.length + 1);
    setEntries((current) => [nextEntry, ...current]);
    appendZodiacDashboardAuditEvent({
      action: "feedback_entry_created",
      route: "/dashboard/networks/zodiac/feedback",
      label: nextEntry.testerLabel,
      status: nextEntry.severity,
      risk: auditRiskForSeverity(nextEntry.severity),
    });
    setForm({ ...defaultForm, testerLabel: `Tester ${entries.length + 2}` });
  }

  function updateEntryStatus(id: string, status: FeedbackStatus) {
    const entry = entries.find((item) => item.id === id);
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    appendZodiacDashboardAuditEvent({
      action: "feedback_entry_updated",
      route: "/dashboard/networks/zodiac/feedback",
      label: entry?.testerLabel ?? id,
      status,
      risk: entry ? auditRiskForSeverity(entry.severity) : "approval",
    });
  }

  function removeEntry(id: string) {
    const entry = entries.find((item) => item.id === id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
    appendZodiacDashboardAuditEvent({
      action: "feedback_entry_updated",
      route: "/dashboard/networks/zodiac/feedback",
      label: entry?.testerLabel ?? id,
      status: "removed-local",
      risk: "approval",
    });
  }

  function updateQaItem(id: string, checked: boolean) {
    setQaState((current) => ({ ...current, [id]: checked }));
    appendZodiacDashboardAuditEvent({
      action: "safety_checklist_changed",
      route: "/dashboard/networks/zodiac/feedback",
      label: id,
      status: checked ? "checked" : "unchecked",
      risk: checked ? "safe" : "approval",
    });
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <section data-qa="feedback-overview-cards" className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <OverviewCard title="Первые 5 пользователей" value={`${summary.testedUsers}/5`} caption={summary.testedUsers >= 5 ? "первый круг заполнен" : "ждём sanitized-сводки"} icon={UsersRound} tone={summary.testedUsers >= 5 ? "emerald" : "amber"} />
        <OverviewCard title="Средняя оценка" value={summary.averageRatingLabel} caption="только оценки 1-10" icon={Target} tone={summary.averageRating >= 7 ? "emerald" : summary.averageRating > 0 ? "amber" : "slate"} />
        <OverviewCard title="P0 bugs" value={summary.p0} caption="стоп расширения" icon={AlertTriangle} tone={summary.p0 > 0 ? "rose" : "emerald"} />
        <OverviewCard title="P1 issues" value={summary.p1} caption="чинить до 20" icon={ClipboardList} tone={summary.p1 > 0 ? "amber" : "emerald"} />
        <OverviewCard title="P2 backlog" value={summary.p2} caption="после P0/P1" icon={ListChecks} tone="slate" />
        <OverviewCard title="Готовность к 20 пользователям" value={summary.readinessTo20} caption="mass launch всё ещё STOP" icon={HeartHandshake} tone={summary.readinessTone} />
      </section>

      <section data-qa="local-feedback-intake" className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Локальный черновик, не серверная база</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Feedback intake board</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Добавляй только короткую sanitized-сводку. Форма не отправляет данные на сервер, не вызывает Telegram API и не создаёт server write API.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            без server write API
          </span>
        </div>

        {entries.length === 0 ? (
          <div data-qa="feedback-empty-state" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
            Реальных отзывов ещё нет. Сначала пригласи 5 тестеров и внеси короткую sanitized-сводку.
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tester label">
              <input value={form.testerLabel} onChange={(event) => updateForm("testerLabel", event.target.value)} className={inputClassName} placeholder="Tester 1" />
            </Field>
            <Field label="Device">
              <select value={form.device} onChange={(event) => updateForm("device", event.target.value as Device)} className={inputClassName}>
                <option value="iphone">iPhone</option>
                <option value="android">Android</option>
                <option value="desktop">Desktop</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
            <Field label="Telegram app">
              <select value={form.telegramApp} onChange={(event) => updateForm("telegramApp", event.target.value as TelegramApp)} className={inputClassName}>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="desktop">Desktop</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
            <Field label="Rating 1-10">
              <input type="number" min={1} max={10} value={form.rating} onChange={(event) => updateForm("rating", event.target.value)} className={inputClassName} placeholder="1-10" />
            </Field>
            <Field label="Would share">
              <select value={form.wouldShare} onChange={(event) => updateForm("wouldShare", event.target.value as WouldShare)} className={inputClassName}>
                <option value="yes">yes</option>
                <option value="no">no</option>
                <option value="unknown">unknown</option>
              </select>
            </Field>
            <Field label="Severity">
              <select value={form.severity} onChange={(event) => updateForm("severity", event.target.value as Severity)} className={inputClassName}>
                <option value="">Select severity</option>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="Backlog">Backlog</option>
                <option value="Positive">Positive</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(event) => updateForm("status", event.target.value as FeedbackStatus)} className={inputClassName}>
                <option value="New">New</option>
                <option value="Accepted">Accepted</option>
                <option value="Fixed">Fixed</option>
                <option value="Deferred">Deferred</option>
              </select>
            </Field>
            <Field label="Strongest feature" wide>
              <input value={form.strongestFeature} onChange={(event) => updateForm("strongestFeature", event.target.value)} className={inputClassName} placeholder="Например: compatibility, tarot, VIP" />
            </Field>
            <Field label="What was confusing" wide>
              <textarea value={form.confusing} onChange={(event) => updateForm("confusing", event.target.value)} rows={3} className={inputClassName} placeholder="Коротко, без имён, телефонов, дат рождения, городов и raw questions." />
            </Field>
            <Field label="What broke" wide>
              <textarea value={form.broke} onChange={(event) => updateForm("broke", event.target.value)} rows={3} className={inputClassName} placeholder="Только sanitized reproduction summary." />
            </Field>
            <Field label="Sanitized note" wide>
              <textarea value={form.sanitizedNote} onChange={(event) => updateForm("sanitizedNote", event.target.value)} rows={4} className={inputClassName} placeholder="Не вставляй raw birth date/time/city/question/intention/result text." />
            </Field>
          </div>

          <div className="space-y-4">
            <div data-qa="feedback-validation" className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Validation</p>
              <ul className="mt-3 space-y-2">
                {validation.items.map((item) => (
                  <li key={item.label} className={`flex items-start gap-2 text-sm font-semibold ${item.ok ? "text-emerald-700" : item.warning ? "text-amber-700" : "text-rose-700"}`}>
                    {item.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
              {validation.sensitiveWarnings.length > 0 ? (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
                  Найдены возможные sensitive-паттерны: {validation.sensitiveWarnings.join(", ")}. Перед сохранением они будут заменены на redacted markers.
                </div>
              ) : null}
            </div>

            <div data-qa="feedback-triage-summary" className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Triage summary</p>
              <div className="mt-3 grid gap-2 text-sm">
                <InfoRow label="Total sanitized entries" value={String(entries.length)} />
                <InfoRow label="Open P0" value={String(triage.openP0)} />
                <InfoRow label="Open P1" value={String(triage.openP1)} />
                <InfoRow label="Repeated confusion" value={triage.repeatedConfusion ? "YES" : "NO"} />
                <InfoRow label="No share/save signal" value={summary.noShareSignal ? "YES" : "NO"} />
              </div>
              <p className="mt-4 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold leading-5 text-violet-800">
                Recommended next action: {summary.recommendedNextAction}
              </p>
            </div>

            <button
              type="button"
              onClick={addFeedbackEntry}
              disabled={!validation.canSave}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <MessageSquareText className="h-4 w-4" />
              Добавить sanitized-сводку
            </button>
          </div>
        </div>

        {entries.length > 0 ? (
          <div data-qa="feedback-cards" className="grid gap-4 lg:grid-cols-2">
            {entries.map((entry) => (
              <FeedbackCard key={entry.id} entry={entry} onStatusChange={(status) => updateEntryStatus(entry.id, status)} onRemove={() => removeEntry(entry.id)} />
            ))}
          </div>
        ) : null}
      </section>

      <section data-qa="real-phone-qa-checklist" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <Phone className="h-3.5 w-3.5" />
              Real Phone QA
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Real Phone QA</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Локальные чекбоксы для ручного Telegram WebView pass. Скриншоты и raw feedback не коммитятся.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
            {qaDoneCount}/{qaItems.length} checked
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {qaItems.map((item) => (
            <label key={item.id} className="flex min-h-12 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(qaState[item.id])}
                onChange={(event) => updateQaItem(item.id, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
          No screenshots committed. Evidence here is a local owner checklist only; real screenshots stay outside the repository unless explicitly sanitized and approved.
        </p>
      </section>

      <section data-qa="feedback-analytics-correlation" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Analytics correlation</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Сравнивай feedback с funnel, не показывая raw sensitive analytics.</p>
            </div>
            <Database className="h-6 w-6 shrink-0 text-violet-700" />
          </div>
          <Link href="/dashboard/networks/zodiac/analytics" className="mt-4 inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100">
            Открыть аналитику
          </Link>
          <p className="mt-2 text-sm font-semibold text-slate-700">/dashboard/networks/zodiac/analytics</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Как читать сигналы</h3>
          <ul className="mt-4 space-y-2 text-sm font-semibold leading-5 text-slate-600">
            <SignalItem text="if app_open grows but feature/result does not, UX issue" />
            <SignalItem text="if result grows but share/save does not, value/CTA issue" />
            <SignalItem text="if feedback has P0/P1, stop 20 users" />
            <SignalItem text="raw sensitive analytics display is not allowed" />
          </ul>
        </div>
      </section>

      <section data-qa="feedback-decision-matrix" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Решение после первых 5 пользователей</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Расширение возможно только после sanitized feedback review, real-phone pass и отсутствия открытых P0/P1.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4" />
            Mass launch: STOP
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <DecisionRule title="Can invite 20" text="0 P0 and 0 unresolved P1 + average rating >= 7 + at least some feature usage." tone="emerald" />
          <DecisionRule title="Any P0" text="Stop and fix before any expansion." tone="rose" />
          <DecisionRule title="Same confusion repeats" text="Fix copy/navigation before more testers." tone="amber" />
          <DecisionRule title="No share/save" text="Improve CTA/value before widening." tone="amber" />
          <DecisionRule title="Sensitive data visible" text="Stop immediately and remove the unsafe surface." tone="rose" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <DecisionBadge label="5 users" value="GO" tone="emerald" />
          <DecisionBadge label="20 users" value="CONDITIONAL" tone="amber" />
          <DecisionBadge label="Mass launch" value="STOP" tone="rose" />
        </div>
      </section>

      <section data-qa="feedback-sanitized-export" className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sanitized owner summary</h2>
            <p className="mt-1 text-sm text-slate-300">Copyable local summary. No raw names, phones, birth data, questions, intentions, result text, tokens, or initData.</p>
          </div>
          <button type="button" onClick={copyExport} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            <Copy className="h-4 w-4" />
            {copied ? "Скопировано" : "Скопировать"}
          </button>
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-black/30 p-3 text-xs leading-5 text-slate-100">{exportText}</pre>
      </section>
    </div>
  );
}

function OverviewCard({ title, value, caption, icon: Icon, tone }: { title: string; value: string | number; caption: string; icon: typeof UsersRound; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-600">{caption}</p>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function FeedbackCard({ entry, onStatusChange, onRemove }: { entry: FeedbackEntry; onStatusChange: (status: FeedbackStatus) => void; onRemove: () => void }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{entry.testerLabel}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">{entry.severity} / {entry.status}</h3>
          <p className="mt-1 text-sm text-slate-500">{entry.device} / Telegram {entry.telegramApp} / rating {entry.rating ?? "none"} / share {entry.wouldShare}</p>
        </div>
        <div className="flex gap-2">
          <select value={entry.status} onChange={(event) => onStatusChange(event.target.value as FeedbackStatus)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
            <option value="New">New</option>
            <option value="Accepted">Accepted</option>
            <option value="Fixed">Fixed</option>
            <option value="Deferred">Deferred</option>
          </select>
          <button type="button" onClick={onRemove} className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
            remove local
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm leading-5 text-slate-700">
        <SafeText label="Strongest feature" value={entry.strongestFeature} />
        <SafeText label="Confusing" value={entry.confusing} />
        <SafeText label="Broke" value={entry.broke} />
        <SafeText label="Sanitized note" value={entry.sanitizedNote} />
      </div>
    </article>
  );
}

function SafeText({ label, value }: { label: string; value: string }) {
  return (
    <p className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="font-semibold text-slate-950">{label}:</span> {value || "not provided"}
    </p>
  );
}

function SignalItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{text}</span>
    </li>
  );
}

function DecisionRule({ title, text, tone }: { title: string; text: string; tone: Tone }) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-5 opacity-90">{text}</p>
    </div>
  );
}

function DecisionBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-lg font-semibold">{label}: {value}</p>
    </div>
  );
}

function validateFeedbackForm(form: FeedbackFormState) {
  const ratingNumber = Number(form.rating);
  const ratingOk = form.rating.trim() === "" || (Number.isInteger(ratingNumber) && ratingNumber >= 1 && ratingNumber <= 10);
  const severityOk = form.severity !== "";
  const testerOk = form.testerLabel.trim().length > 0;
  const sensitiveWarnings = detectSensitiveWarnings([form.strongestFeature, form.confusing, form.broke, form.sanitizedNote].join("\n"));

  return {
    canSave: testerOk && ratingOk && severityOk,
    sensitiveWarnings,
    items: [
      { label: "tester label задан без реального имени", ok: testerOk },
      { label: "rating 1-10 if provided", ok: ratingOk },
      { label: "severity required", ok: severityOk },
      { label: "no raw birth date/time/city/question/intention/result text", ok: sensitiveWarnings.length === 0, warning: sensitiveWarnings.length > 0 },
      { label: "will be saved only to localStorage", ok: true },
    ],
  };
}

function buildFeedbackEntry(form: FeedbackFormState, fallbackIndex: number): FeedbackEntry {
  const createdAt = new Date().toISOString();
  const ratingNumber = Number(form.rating);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    testerLabel: sanitizeShortLabel(form.testerLabel) || `Tester ${fallbackIndex}`,
    device: form.device,
    telegramApp: form.telegramApp,
    rating: form.rating.trim() === "" || !Number.isInteger(ratingNumber) ? null : ratingNumber,
    strongestFeature: sanitizeText(form.strongestFeature),
    confusing: sanitizeText(form.confusing),
    broke: sanitizeText(form.broke),
    wouldShare: form.wouldShare,
    severity: form.severity || "Backlog",
    status: form.status,
    sanitizedNote: sanitizeText(form.sanitizedNote),
  };
}

function sanitizeLoadedEntry(entry: Partial<FeedbackEntry>): FeedbackEntry | null {
  if (!entry || typeof entry !== "object" || !entry.id) return null;

  return {
    id: String(entry.id),
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
    testerLabel: sanitizeShortLabel(String(entry.testerLabel ?? "Tester")),
    device: normalizeEnum(entry.device, ["iphone", "android", "desktop", "unknown"], "unknown"),
    telegramApp: normalizeEnum(entry.telegramApp, ["ios", "android", "desktop", "unknown"], "unknown"),
    rating: typeof entry.rating === "number" && entry.rating >= 1 && entry.rating <= 10 ? entry.rating : null,
    strongestFeature: sanitizeText(String(entry.strongestFeature ?? "")),
    confusing: sanitizeText(String(entry.confusing ?? "")),
    broke: sanitizeText(String(entry.broke ?? "")),
    wouldShare: normalizeEnum(entry.wouldShare, ["yes", "no", "unknown"], "unknown"),
    severity: normalizeEnum(entry.severity, ["P0", "P1", "P2", "Backlog", "Positive"], "Backlog"),
    status: normalizeEnum(entry.status, ["New", "Accepted", "Fixed", "Deferred"], "New"),
    sanitizedNote: sanitizeText(String(entry.sanitizedNote ?? "")),
  };
}

function isFeedbackEntry(entry: FeedbackEntry | null): entry is FeedbackEntry {
  return entry !== null;
}

function auditRiskForSeverity(severity: FeedbackEntry["severity"]): "safe" | "approval" | "blocked" {
  if (severity === "P0") return "blocked";
  if (severity === "P1") return "approval";
  return "safe";
}

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function buildFeedbackSummary(entries: FeedbackEntry[]) {
  const ratings = entries.map((entry) => entry.rating).filter((rating): rating is number => typeof rating === "number");
  const averageRating = ratings.length > 0 ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 : 0;
  const unresolved = entries.filter((entry) => entry.status !== "Fixed" && entry.status !== "Deferred");
  const p0 = unresolved.filter((entry) => entry.severity === "P0").length;
  const p1 = unresolved.filter((entry) => entry.severity === "P1").length;
  const p2 = unresolved.filter((entry) => entry.severity === "P2" || entry.severity === "Backlog").length;
  const hasFeatureUsage = entries.some((entry) => entry.strongestFeature.trim().length > 0);
  const noShareSignal = entries.length > 0 && entries.every((entry) => entry.wouldShare !== "yes");
  const testedUsers = Math.min(entries.length, 5);

  let readinessTo20 = "WAIT";
  let readinessTone: Tone = "amber";
  let recommendedNextAction = "Пригласить первых 5 тестеров и внести sanitized-сводки.";

  if (p0 > 0) {
    readinessTo20 = "STOP";
    readinessTone = "rose";
    recommendedNextAction = "Остановить расширение и исправить P0.";
  } else if (p1 > 0) {
    readinessTo20 = "FIX P1";
    readinessTone = "amber";
    recommendedNextAction = "Закрыть P1 перед приглашением 20 пользователей.";
  } else if (entries.length < 5) {
    readinessTo20 = "WAIT";
    readinessTone = "amber";
  } else if (averageRating < 7 || !hasFeatureUsage) {
    readinessTo20 = "CONDITIONAL";
    readinessTone = "amber";
    recommendedNextAction = "Улучшить понятность/value и повторить проверку.";
  } else if (noShareSignal) {
    readinessTo20 = "CTA FIX";
    readinessTone = "amber";
    recommendedNextAction = "Усилить share/save CTA перед расширением.";
  } else {
    readinessTo20 = "CAN INVITE 20";
    readinessTone = "emerald";
    recommendedNextAction = "Можно рассмотреть 20 пользователей при чистом real-phone pass.";
  }

  return {
    testedUsers,
    averageRating,
    averageRatingLabel: ratings.length > 0 ? String(averageRating) : "нет",
    p0,
    p1,
    p2,
    noShareSignal,
    readinessTo20,
    readinessTone,
    recommendedNextAction,
  };
}

function buildTriageSummary(entries: FeedbackEntry[]) {
  const open = entries.filter((entry) => entry.status !== "Fixed" && entry.status !== "Deferred");
  const confusionBuckets = new Map<string, number>();

  for (const entry of entries) {
    const key = entry.confusing.trim().toLowerCase();
    if (key.length >= 8) confusionBuckets.set(key, (confusionBuckets.get(key) ?? 0) + 1);
  }

  return {
    openP0: open.filter((entry) => entry.severity === "P0").length,
    openP1: open.filter((entry) => entry.severity === "P1").length,
    repeatedConfusion: Array.from(confusionBuckets.values()).some((count) => count >= 2),
  };
}

function buildSanitizedExport(entries: FeedbackEntry[], qaState: QaState, nextAction: string) {
  const lines = [
    "Package 61 local feedback summary",
    `Entries: ${entries.length}`,
    `Real Phone QA: ${qaItems.filter((item) => qaState[item.id]).length}/${qaItems.length}`,
    `Recommended next action: ${nextAction}`,
    "",
    "Feedback:",
    entries.length === 0 ? "- No real feedback yet." : entries.map((entry) => `- ${entry.testerLabel}: ${entry.severity}/${entry.status}, device=${entry.device}, telegram=${entry.telegramApp}, rating=${entry.rating ?? "none"}, share=${entry.wouldShare}, feature=${entry.strongestFeature || "n/a"}`).join("\n"),
    "",
    "Real Phone QA checked:",
    qaItems.filter((item) => qaState[item.id]).map((item) => `- ${item.label}`).join("\n") || "- none",
  ];

  return lines.join("\n");
}

function sanitizeShortLabel(value: string) {
  const sanitized = sanitizeText(value).replace(/[^A-Za-z0-9 _-]/g, "").trim();
  return sanitized.slice(0, 40);
}

function sanitizeText(value: string) {
  let sanitized = value.trim();
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern.regex, pattern.replacement);
  }
  if (sanitized.length > 700) sanitized = `${sanitized.slice(0, 700).trim()}... [trimmed]`;
  return sanitized;
}

function detectSensitiveWarnings(value: string) {
  const warnings = new Set<string>();
  for (const pattern of sensitivePatterns) {
    if (pattern.regex.test(value)) warnings.add(pattern.label);
    pattern.regex.lastIndex = 0;
  }
  return Array.from(warnings);
}

const sensitivePatterns = [
  { label: "phone", regex: /(?:\+?\d[\s().-]?){8,}\d/g, replacement: "[redacted-phone]" },
  { label: "email", regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: "[redacted-email]" },
  { label: "token/env", regex: /\b(?:bot[_-]?token|token|secret|password|redis|initData)\s*[:=]\s*[^\s,;]+/gi, replacement: "[redacted-secret]" },
  { label: "date of birth", regex: /\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g, replacement: "[redacted-date]" },
  { label: "birth time", regex: /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g, replacement: "[redacted-time]" },
  { label: "raw private field", regex: /\b(?:birth date|birth time|city|question|intention|result text|дата рождения|время рождения|город|вопрос|намерение|текст результата)\s*[:=]\s*[^,\n;]+/gi, replacement: "[redacted-private-field]" },
];

type Tone = "emerald" | "cyan" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
