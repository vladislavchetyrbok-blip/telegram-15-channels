"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { hasTarotImageAsset, selectDailyTarotCard } from "@/lib/zodiac-tarot-daily";

interface DailyTarotCardFeatureProps {
  publicMode: boolean;
  dateKey: string;
  telegramUserId?: string | number | null;
  onReveal?: () => void;
}

const flipSceneStyle: CSSProperties = { perspective: "1200px" };
const flipCardStyle: CSSProperties = { transformStyle: "preserve-3d" };
const cardFaceStyle: CSSProperties = { backfaceVisibility: "hidden" };
const cardBackStyle: CSSProperties = { backfaceVisibility: "hidden", transform: "rotateY(180deg)" };

export function DailyTarotCardFeature({ publicMode, dateKey, telegramUserId, onReveal }: DailyTarotCardFeatureProps) {
  const selection = useMemo(() => selectDailyTarotCard(dateKey, telegramUserId), [dateKey, telegramUserId]);
  const imageAssetAvailable = hasTarotImageAsset(selection.card.imagePath);
  const [revealed, setRevealed] = useState(false);
  const [imageReady, setImageReady] = useState(imageAssetAvailable);

  useEffect(() => {
    setRevealed(false);
    setImageReady(imageAssetAvailable);
  }, [imageAssetAvailable, selection.card.id, selection.dateKey, selection.seedMode]);

  return (
    <section
      className={
        publicMode
          ? "space-y-4 overflow-hidden rounded-lg border border-amber-200/20 bg-[radial-gradient(circle_at_18%_0%,rgba(244,114,182,0.18),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(251,191,36,0.13),transparent_26%),linear-gradient(155deg,#070713,#111331_42%,#24113b)] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.36)] min-[390px]:p-4"
          : "space-y-4 overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 via-slate-50 to-amber-50 p-4 shadow-sm"
      }
      data-tarot-v1-daily-card="true"
      data-tarot-seed-mode={selection.seedMode}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-[0.22em] text-amber-100" : "text-xs font-semibold uppercase tracking-[0.22em] text-violet-800"}>
            Карта дня
          </p>
          <h2 className={publicMode ? "mt-2 text-2xl font-semibold leading-8 text-white" : "mt-2 text-2xl font-semibold leading-8 text-slate-950"}>
            Открой главный знак сегодняшнего дня
          </h2>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>
            Один аркан на день, выбранный стабильно для этой даты и твоего Telegram-профиля, если он доступен.
          </p>
        </div>
        <span className={publicMode ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-amber-200/10 text-amber-100" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800"}>
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!revealed) {
            onReveal?.();
          }
          setRevealed(true);
        }}
        className={
          publicMode
            ? "min-h-12 w-full rounded-lg bg-[linear-gradient(135deg,#f6d58a,#f3b0c5_48%,#a78bfa)] px-4 py-3 text-sm font-bold text-[#140716] shadow-[0_18px_46px_rgba(246,213,138,0.18)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-amber-100/60"
            : "min-h-12 w-full rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-violet-300"
        }
      >
        Открыть карту дня
      </button>

      <div className="mx-auto w-full max-w-[288px]" style={flipSceneStyle}>
        <div
          className="relative aspect-[5/8] w-full transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ ...flipCardStyle, transform: revealed ? "rotateY(0deg)" : "rotateY(180deg)" }}
          data-tarot-reveal-state={revealed ? "revealed" : "closed"}
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg border border-amber-100/45 bg-[#12091f] shadow-[0_24px_70px_rgba(0,0,0,0.42)]" style={cardFaceStyle}>
            {imageAssetAvailable && imageReady ? (
              <Image
                src={selection.card.imagePath}
                alt={`${selection.card.ruTitle} tarot card`}
                fill
                sizes="288px"
                className="object-cover"
                priority={false}
                onError={() => setImageReady(false)}
              />
            ) : (
              <TarotFallbackCard publicMode={publicMode} title={selection.card.ruTitle} number={selection.card.number} keywords={selection.card.keywords} />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,12,0.05),rgba(5,3,12,0.1)_52%,rgba(5,3,12,0.3))]" />
          </div>

          <div
            className="absolute inset-0 flex flex-col items-center justify-between rounded-lg border border-amber-100/35 bg-[radial-gradient(circle_at_50%_18%,rgba(246,213,138,0.18),transparent_24%),linear-gradient(150deg,#090817,#1c1537,#3b1746)] p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
            style={cardBackStyle}
          >
            <div className="h-10 w-10 rounded-full border border-amber-100/35 bg-amber-100/10" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/80">Major Arcana</p>
              <p className="mt-3 text-2xl font-semibold text-white">Карта дня</p>
              <p className="mt-2 text-sm leading-5 text-slate-300">Нажми, чтобы открыть аркан</p>
            </div>
            <div className="h-10 w-10 rounded-full border border-rose-200/25 bg-rose-200/10" />
          </div>
        </div>
      </div>

      {revealed ? (
        <div className="space-y-3" data-tarot-v1-result="true">
          <div className={publicMode ? "rounded-lg border border-white/10 bg-white/[0.07] p-3 text-center" : "rounded-lg border border-slate-200 bg-white p-3 text-center"}>
            <p className={publicMode ? "text-xs font-semibold uppercase tracking-[0.22em] text-amber-100" : "text-xs font-semibold uppercase tracking-[0.22em] text-violet-800"}>
              Аркан {String(selection.card.number).padStart(2, "0")}
            </p>
            <h3 className={publicMode ? "mt-1 text-2xl font-semibold text-white" : "mt-1 text-2xl font-semibold text-slate-950"}>{selection.card.ruTitle}</h3>
            <p className={publicMode ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-500"}>{selection.card.enTitle}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {selection.card.keywords.map((keyword) => (
                <span key={keyword} className={publicMode ? "rounded-md border border-amber-100/20 bg-amber-100/10 px-2 py-1 text-[11px] font-semibold text-amber-50" : "rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900"}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <TarotMeaningBlock publicMode={publicMode} label="Значение дня" text={selection.card.dayMeaning} />
            <TarotMeaningBlock publicMode={publicMode} label="В любви" text={selection.card.loveMeaning} />
            <TarotMeaningBlock publicMode={publicMode} label="Совет" text={selection.card.advice} />
            <TarotMeaningBlock publicMode={publicMode} label="Действие дня" text={selection.card.action} tone="action" />
          </div>

          <div className="grid gap-2 min-[390px]:grid-cols-2">
            <Link
              href="/compatibility?startapp=compat_love"
              className={publicMode ? "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm font-semibold text-white transition hover:bg-white/12" : "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"}
            >
              Совместимость
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/miniapp"
              className={publicMode ? "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-200/25 bg-amber-200/10 px-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/15" : "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"}
            >
              Главная Mini App
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TarotFallbackCard({ publicMode, title, number, keywords }: { publicMode: boolean; title: string; number: number; keywords: string[] }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-between bg-[radial-gradient(circle_at_50%_20%,rgba(246,213,138,0.18),transparent_26%),linear-gradient(160deg,#080816,#17172f_46%,#32143f)] p-5 text-center"
      data-tarot-image-fallback="true"
    >
      <div className="w-full rounded-lg border border-amber-100/25 bg-amber-100/10 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/85">Старший аркан</p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-100">Major Arcana</p>
        <p className="text-5xl font-semibold text-amber-100">{String(number).padStart(2, "0")}</p>
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-5 text-slate-300">{keywords.join(" · ")}</p>
      </div>
      <div className={publicMode ? "h-12 w-full rounded-lg border border-rose-200/20 bg-rose-200/10" : "h-12 w-full rounded-lg border border-amber-100/25 bg-amber-100/10"} />
    </div>
  );
}

function TarotMeaningBlock({ publicMode, label, text, tone = "default" }: { publicMode: boolean; label: string; text: string; tone?: "default" | "action" }) {
  const toneClass =
    tone === "action"
      ? publicMode
        ? "border-emerald-200/20 bg-emerald-200/10"
        : "border-emerald-200 bg-emerald-50"
      : publicMode
        ? "border-white/10 bg-black/18"
        : "border-slate-200 bg-white";
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <p className={publicMode ? "text-[11px] font-semibold uppercase tracking-wide text-amber-100" : "text-[11px] font-semibold uppercase tracking-wide text-violet-800"}>{label}</p>
      <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-700"}>{text}</p>
    </div>
  );
}
