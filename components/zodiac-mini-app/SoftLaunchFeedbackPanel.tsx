"use client";

import { useMemo, useState } from "react";
import { Bug, Copy, Lightbulb, MessageSquare, Share2, ShieldCheck, X } from "lucide-react";
import type { ZodiacAnalyticsEventName, ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";

type FeedbackType = "feedback" | "bug" | "idea";
type FeedbackFeatureKey =
  | "compatibility"
  | "premium_natal"
  | "birth_matrix"
  | "tarot_rune"
  | "lunar_ritual"
  | "angel_numbers"
  | "vip"
  | "profile";
type RatingBucket = "none" | "1_3" | "4_6" | "7_8" | "9_10";

interface SoftLaunchFeedbackPanelProps {
  publicMode: boolean;
  onEvent: (event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) => void;
  onShareDraft: (draft: string, payload: ZodiacAnalyticsPayload) => Promise<string> | string;
}

const feedbackTypes: Array<{ id: FeedbackType; label: string; icon: typeof MessageSquare }> = [
  { id: "feedback", label: "Отзыв", icon: MessageSquare },
  { id: "bug", label: "Баг", icon: Bug },
  { id: "idea", label: "Идея", icon: Lightbulb },
];

const featureOptions: Array<{ id: FeedbackFeatureKey; label: string }> = [
  { id: "compatibility", label: "Compatibility" },
  { id: "premium_natal", label: "Premium Natal" },
  { id: "birth_matrix", label: "Birth Matrix" },
  { id: "tarot_rune", label: "Tarot/Rune" },
  { id: "lunar_ritual", label: "Lunar/Ritual" },
  { id: "angel_numbers", label: "Angel Numbers" },
  { id: "vip", label: "VIP" },
  { id: "profile", label: "Profile" },
];

export function SoftLaunchFeedbackPanel({ publicMode, onEvent, onShareDraft }: SoftLaunchFeedbackPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feedback");
  const [featureKey, setFeatureKey] = useState<FeedbackFeatureKey>("compatibility");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const safePayload = useMemo<ZodiacAnalyticsPayload>(
    () => ({
      section: "feedback",
      feedbackType,
      featureKey,
      ratingBucket: ratingToBucket(rating),
      hasComment: comment.trim().length > 0,
    }),
    [comment, featureKey, feedbackType, rating],
  );

  const draft = useMemo(() => buildFeedbackDraft({ feedbackType, featureKey, rating, comment }), [comment, featureKey, feedbackType, rating]);

  function openPanel(nextType: FeedbackType) {
    setFeedbackType(nextType);
    setIsOpen(true);
    setStatus("");
    onEvent("feedback_opened", {
      section: "feedback",
      feedbackType: nextType,
      featureKey,
      ratingBucket: ratingToBucket(rating),
      hasComment: comment.trim().length > 0,
    });
  }

  async function copyDraft() {
    setStatus("");
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft);
      }
      onEvent("feedback_draft_copied", safePayload);
      setStatus("Скопировано");
    } catch {
      onEvent("feedback_draft_copied", safePayload);
      setStatus("Текст готов, можно выделить и скопировать вручную");
    }
  }

  async function shareDraft() {
    setStatus("");
    onEvent("feedback_share_started", safePayload);
    const label = await onShareDraft(draft, safePayload);
    setStatus(label || "Ссылка готова");
  }

  return (
    <div className={publicMode ? "mt-4 rounded-lg border border-fuchsia-200/25 bg-fuchsia-200/10 p-4" : "mt-4 rounded-lg border border-white/12 bg-white/8 p-4"}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/25 bg-fuchsia-200/10 text-fuchsia-100">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Помогите улучшить Mini App</p>
          <p className="mt-1 text-sm leading-5 text-slate-300">Отзыв не сохраняется в профиле и не уходит в аналитику raw-текстом. Мы подготовим безопасный драфт для копирования.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => openPanel("feedback")} className="rounded-lg border border-emerald-200/25 bg-emerald-200/10 px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-200/15">
              Оставить отзыв
            </button>
            <button type="button" onClick={() => openPanel("bug")} className="rounded-lg border border-rose-200/25 bg-rose-200/10 px-3 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-200/15">
              Сообщить о баге
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-4 rounded-lg border border-white/12 bg-black/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-100">Soft launch feedback</p>
              <h3 className="mt-1 text-base font-semibold text-white">Безопасный драфт отзыва</h3>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-md border border-white/12 bg-white/8 p-2 text-slate-200 transition hover:bg-white/12" aria-label="Закрыть feedback panel">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-300">Тип</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  const active = feedbackType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setFeedbackType(type.id);
                        setStatus("");
                      }}
                      className={active ? "rounded-lg border border-amber-200/45 bg-amber-200/15 p-2 text-sm font-semibold text-amber-50" : "rounded-lg border border-white/12 bg-white/8 p-2 text-sm font-semibold text-slate-200"}
                    >
                      <Icon className="mx-auto mb-1 h-4 w-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300">Экран / функция</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {featureOptions.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => {
                      setFeatureKey(feature.id);
                      setStatus("");
                    }}
                    className={featureKey === feature.id ? "rounded-lg border border-amber-200/45 bg-amber-200/15 px-3 py-2 text-left text-sm font-semibold text-amber-50" : "rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-left text-sm font-semibold text-slate-200"}
                  >
                    {feature.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300">Оценка, если удобно</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setRating((current) => (current === value ? null : value));
                      setStatus("");
                    }}
                    className={rating === value ? "h-9 w-9 rounded-lg border border-amber-200/50 bg-amber-200/20 text-sm font-semibold text-amber-50" : "h-9 w-9 rounded-lg border border-white/12 bg-white/8 text-sm font-semibold text-slate-200"}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-300">Комментарий, опционально</span>
              <textarea
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value.slice(0, 480));
                  setStatus("");
                }}
                placeholder="Без имён, дат рождения, города и других личных данных."
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-white/12 bg-slate-950 px-3 py-2 text-sm leading-5 text-white outline-none placeholder:text-slate-500 focus:border-amber-200/50"
              />
              <span className="mt-1 flex items-center gap-1.5 text-xs leading-4 text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Комментарий не пишется в localStorage, не отправляется в analytics и не вставляется в драфт автоматически.
              </span>
            </label>

            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-5 text-slate-200">{draft}</pre>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyDraft} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200/25 bg-emerald-200/10 px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-200/15">
                <Copy className="h-4 w-4" />
                Скопировать текст
              </button>
              <button type="button" onClick={shareDraft} className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-200/25 bg-fuchsia-200/10 px-3 py-2 text-sm font-semibold text-fuchsia-50 transition hover:bg-fuchsia-200/15">
                <Share2 className="h-4 w-4" />
                Поделиться отзывом
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12">
                Закрыть
              </button>
            </div>
            {status ? <p className="rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm font-semibold text-emerald-50">{status}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildFeedbackDraft({ feedbackType, featureKey, rating, comment }: { feedbackType: FeedbackType; featureKey: FeedbackFeatureKey; rating: number | null; comment: string }) {
  const isBug = feedbackType === "bug";
  const commentHint = comment.trim() ? "добавьте коротко вручную, без личных данных" : "";
  return [
    `Функция: ${featureOptions.find((item) => item.id === featureKey)?.label ?? featureKey}`,
    `Тип: ${feedbackTypes.find((item) => item.id === feedbackType)?.label ?? feedbackType}`,
    `Оценка: ${rating ?? "не указана"}`,
    `Что понравилось: ${!isBug ? commentHint : ""}`,
    `Что сломалось: ${isBug ? commentHint : ""}`,
    "Телефон: iPhone / Android",
    "Скриншот можно приложить вручную.",
  ].join("\n");
}

function ratingToBucket(value: number | null): RatingBucket {
  if (!value) return "none";
  if (value <= 3) return "1_3";
  if (value <= 6) return "4_6";
  if (value <= 8) return "7_8";
  return "9_10";
}
