export type ZodiacDashboardAuditAction =
  | "channel_draft_updated"
  | "manual_post_draft_updated"
  | "feedback_entry_created"
  | "feedback_entry_updated"
  | "safety_checklist_changed"
  | "approval_note_created"
  | "audit_log_cleared";

export interface ZodiacDashboardAuditEvent {
  id: string;
  action: ZodiacDashboardAuditAction;
  timestamp: string;
  route: string;
  label: string;
  status: string;
  risk: "safe" | "approval" | "blocked";
}

export interface ZodiacDashboardAuditInput {
  action: ZodiacDashboardAuditAction;
  route: string;
  label: string;
  status?: string;
  risk?: ZodiacDashboardAuditEvent["risk"];
}

export const zodiacDashboardAuditStorageKey = "zodiac-platform-admin-audit-log-v1";

const maxAuditEvents = 100;

export function readZodiacDashboardAuditLog(): ZodiacDashboardAuditEvent[] {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(zodiacDashboardAuditStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeAuditEvent).filter(isAuditEvent).slice(0, maxAuditEvents);
  } catch {
    return [];
  }
}

export function appendZodiacDashboardAuditEvent(input: ZodiacDashboardAuditInput) {
  if (!canUseLocalStorage()) return null;

  const event: ZodiacDashboardAuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action: input.action,
    timestamp: new Date().toISOString(),
    route: sanitizeAuditText(input.route, 96) || "/dashboard/networks/zodiac",
    label: sanitizeAuditText(input.label, 80) || "dashboard action",
    status: sanitizeAuditText(input.status ?? "updated", 64) || "updated",
    risk: input.risk ?? "safe",
  };

  const nextLog = [event, ...readZodiacDashboardAuditLog()].slice(0, maxAuditEvents);
  window.localStorage.setItem(zodiacDashboardAuditStorageKey, JSON.stringify(nextLog));
  window.dispatchEvent(new CustomEvent("zodiac-dashboard-audit-updated", { detail: event }));
  return event;
}

export function clearZodiacDashboardAuditLog() {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(zodiacDashboardAuditStorageKey);
  window.dispatchEvent(new CustomEvent("zodiac-dashboard-audit-updated"));
}

export function formatZodiacDashboardAuditLog(events: ZodiacDashboardAuditEvent[]) {
  if (events.length === 0) return "Local audit log is empty.";

  return events
    .map((event) => `${event.timestamp} | ${event.action} | ${event.route} | ${event.label} | ${event.status} | ${event.risk}`)
    .join("\n");
}

function sanitizeAuditEvent(value: unknown): ZodiacDashboardAuditEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Partial<ZodiacDashboardAuditEvent>;
  const risk = event.risk === "approval" || event.risk === "blocked" ? event.risk : "safe";

  return {
    id: sanitizeAuditText(event.id ?? "", 64) || `${Date.now()}-legacy`,
    action: normalizeAction(event.action),
    timestamp: sanitizeAuditText(event.timestamp ?? "", 40) || new Date().toISOString(),
    route: sanitizeAuditText(event.route ?? "", 96) || "/dashboard/networks/zodiac",
    label: sanitizeAuditText(event.label ?? "", 80) || "dashboard action",
    status: sanitizeAuditText(event.status ?? "", 64) || "updated",
    risk,
  };
}

function isAuditEvent(event: ZodiacDashboardAuditEvent | null): event is ZodiacDashboardAuditEvent {
  return event !== null;
}

function normalizeAction(action: unknown): ZodiacDashboardAuditAction {
  const allowed: ZodiacDashboardAuditAction[] = [
    "channel_draft_updated",
    "manual_post_draft_updated",
    "feedback_entry_created",
    "feedback_entry_updated",
    "safety_checklist_changed",
    "approval_note_created",
    "audit_log_cleared",
  ];

  return typeof action === "string" && allowed.includes(action as ZodiacDashboardAuditAction) ? (action as ZodiacDashboardAuditAction) : "approval_note_created";
}

function sanitizeAuditText(value: unknown, maxLength: number) {
  let text = typeof value === "string" ? value : String(value ?? "");

  for (const pattern of sensitivePatterns) {
    text = text.replace(pattern, "[redacted]");
  }

  return text.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const sensitivePatterns = [
  /(?:\+?\d[\s().-]?){8,}\d/g,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /\b(?:bot[_-]?token|token|secret|password|redis|initData)\s*[:=]\s*[^\s,;]+/gi,
  /\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g,
  /\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g,
  /\b(?:birth date|birth time|city|question|intention|result text|дата рождения|время рождения|город|вопрос|намерение|текст результата)\s*[:=]\s*[^,\n;]+/gi,
];
