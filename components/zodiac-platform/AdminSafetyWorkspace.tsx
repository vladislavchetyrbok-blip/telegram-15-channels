"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, FileText, ShieldCheck, Trash2 } from "lucide-react";
import {
  appendZodiacDashboardAuditEvent,
  clearZodiacDashboardAuditLog,
  formatZodiacDashboardAuditLog,
  readZodiacDashboardAuditLog,
  type ZodiacDashboardAuditEvent,
} from "@/lib/zodiac-dashboard-audit";

type ChecklistState = Record<string, boolean>;

const checklistStorageKey = "zodiac-platform-safety-checklist-v1";

const checklistItems = [
  { id: "first-5-tested", label: "first 5 users tested" },
  { id: "no-p0", label: "no P0" },
  { id: "no-unresolved-p1", label: "no unresolved P1" },
  { id: "iphone-pass", label: "real phone iPhone pass" },
  { id: "android-pass", label: "real phone Android pass" },
  { id: "feature-usage", label: "analytics funnel has feature usage" },
  { id: "feedback-reviewed", label: "feedback reviewed" },
  { id: "no-sensitive-data", label: "no raw sensitive data visible" },
  { id: "dry-api-zero", label: "dry-run API calls 0" },
  { id: "dry-ledger-zero", label: "ledger writes 0 in dry-run" },
  { id: "weekly-off", label: "weekly live OFF" },
  { id: "payments-off", label: "payments OFF" },
  { id: "profile-sync-off", label: "profile sync OFF" },
];

export function AdminSafetyWorkspace() {
  const [events, setEvents] = useState<ZodiacDashboardAuditEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [loaded, setLoaded] = useState(false);
  const [approvalLabel, setApprovalLabel] = useState("Manual approval note");
  const [approvalStatus, setApprovalStatus] = useState("draft-only");
  const [approvalRisk, setApprovalRisk] = useState<"safe" | "approval" | "blocked">("approval");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEvents(readZodiacDashboardAuditLog());

    try {
      const storedChecklist = window.localStorage.getItem(checklistStorageKey);
      if (storedChecklist) {
        const parsed = JSON.parse(storedChecklist) as ChecklistState;
        setChecklist(parsed && typeof parsed === "object" ? parsed : {});
      }
    } catch {
      setChecklist({});
    } finally {
      setLoaded(true);
    }

    function refreshLog() {
      setEvents(readZodiacDashboardAuditLog());
    }

    window.addEventListener("zodiac-dashboard-audit-updated", refreshLog);
    return () => window.removeEventListener("zodiac-dashboard-audit-updated", refreshLog);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(checklistStorageKey, JSON.stringify(checklist));
  }, [checklist, loaded]);

  const checkedCount = checklistItems.filter((item) => checklist[item.id]).length;
  const auditExport = useMemo(() => formatZodiacDashboardAuditLog(events), [events]);

  function updateChecklist(id: string, checked: boolean) {
    setChecklist((current) => ({ ...current, [id]: checked }));
    appendZodiacDashboardAuditEvent({
      action: "safety_checklist_changed",
      route: "/dashboard/networks/zodiac/security",
      label: id,
      status: checked ? "checked" : "unchecked",
      risk: checked ? "safe" : "approval",
    });
  }

  function addApprovalNote() {
    appendZodiacDashboardAuditEvent({
      action: "approval_note_created",
      route: "/dashboard/networks/zodiac/security",
      label: approvalLabel,
      status: approvalStatus,
      risk: approvalRisk,
    });
    setApprovalLabel("Manual approval note");
  }

  function clearLog() {
    clearZodiacDashboardAuditLog();
    setEvents([]);
    setCopied(false);
  }

  async function copyAuditLog() {
    try {
      await navigator.clipboard.writeText(auditExport);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <section data-qa="admin-safety-checklist" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">localStorage only</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Перед 20 пользователями</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Локальный safety checklist для владельца. Он не отправляется на сервер и не меняет Telegram/ledger.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
            <CheckCircle2 className="h-4 w-4" />
            {checkedCount}/{checklistItems.length}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {checklistItems.map((item) => (
            <label key={item.id} className="flex min-h-12 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(checklist[item.id])}
                onChange={(event) => updateChecklist(item.id, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section data-qa="local-admin-audit-log" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Локальный журнал, не серверная база</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Audit log</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Записываются только action type, timestamp, route, sanitized label и status/risk. Токены, initData, raw feedback, даты рождения и result text не сохраняются.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            no server write API
          </span>
        </div>

        <div data-qa="approval-note-form" className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_160px_auto] md:items-end">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            <span>Approval note label</span>
            <input value={approvalLabel} onChange={(event) => setApprovalLabel(event.target.value)} className={inputClassName} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            <span>Status</span>
            <select value={approvalStatus} onChange={(event) => setApprovalStatus(event.target.value)} className={inputClassName}>
              <option value="draft-only">draft-only</option>
              <option value="needs-owner-approval">needs-owner-approval</option>
              <option value="blocked">blocked</option>
              <option value="reviewed">reviewed</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            <span>Risk</span>
            <select value={approvalRisk} onChange={(event) => setApprovalRisk(event.target.value as "safe" | "approval" | "blocked")} className={inputClassName}>
              <option value="safe">safe</option>
              <option value="approval">approval</option>
              <option value="blocked">blocked</option>
            </select>
          </label>
          <button type="button" onClick={addApprovalNote} className="inline-flex items-center justify-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100">
            <FileText className="h-4 w-4" />
            Добавить
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={copyAuditLog} className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100">
            <Copy className="h-4 w-4" />
            {copied ? "Скопировано" : "Export/copy sanitized audit log"}
          </button>
          <button type="button" onClick={clearLog} className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100">
            <Trash2 className="h-4 w-4" />
            Clear local audit log
          </button>
        </div>

        {events.length === 0 ? (
          <div data-qa="audit-empty-state" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
            Локальный audit log пока пуст. Создай approval note или измени safety checklist, чтобы появилась запись.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <article key={event.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-[180px_1fr_120px] md:items-start">
                <div>
                  <p className="font-mono text-xs font-semibold text-slate-500">{event.timestamp}</p>
                  <p className="mt-1 font-semibold text-slate-950">{event.action}</p>
                </div>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-800">{event.label}</p>
                  <p className="mt-1 break-words text-slate-500">{event.route}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{event.status}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[event.risk]}`}>{event.risk}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

const riskClasses = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  approval: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
};
