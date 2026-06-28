import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeCard } from "./AphroditeCard";
import { aphroditeClassNames } from "./shared";

export type AphroditeLockedPreviewVariant =
  | "general"
  | "home"
  | "compatibility"
  | "birthMatrix"
  | "mystic"
  | "natal";

export type AphroditeLockedPreviewCardProps = {
  variant?: AphroditeLockedPreviewVariant;
  scope?: string;
  title?: string;
  subtitle?: string;
  preview?: string;
  features?: readonly string[];
  previewItems?: readonly string[];
  lockLabel?: string;
  safetyLabel?: string;
  className?: string;
};

const variantAccent: Record<AphroditeLockedPreviewVariant, string> = {
  general: "before:from-amber-200/18 before:via-violet-300/12 before:to-rose-300/10",
  home: "before:from-rose-300/18 before:via-violet-300/14 before:to-amber-200/12",
  compatibility: "before:from-rose-300/20 before:via-fuchsia-300/14 before:to-amber-200/12",
  birthMatrix: "before:from-amber-200/20 before:via-violet-300/14 before:to-cyan-200/10",
  mystic: "before:from-violet-300/20 before:via-fuchsia-300/14 before:to-amber-200/12",
  natal: "before:from-cyan-200/16 before:via-violet-300/14 before:to-rose-300/12",
};

const defaultFeatures: Record<AphroditeLockedPreviewVariant, readonly string[]> = {
  general: ["Глубокая совместимость", "Матрица Pro", "Личный совет"],
  home: ["Разбор пары", "Матрица Pro", "Карточка результата"],
  compatibility: ["Разбор совместимости", "Календарь пары", "Зоны риска"],
  birthMatrix: ["Матрица Pro", "Личный совет", "Паттерны отношений"],
  mystic: ["Глубокое чтение", "Личный ритуал", "Предупреждение"],
  natal: ["Натальный профиль", "Личный совет", "Карьера и циклы"],
};

const defaultPreviewItems: Record<AphroditeLockedPreviewVariant, readonly string[]> = {
  general: ["Preview-режим", "Без оплаты", "VIP закрыт"],
  home: ["Preview", "Без оплаты", "VIP закрыт"],
  compatibility: ["Динамика эмоций", "Календарь любви", "Связь с Матрицей"],
  birthMatrix: ["Циклы", "Деньги и предназначение", "Паттерны отношений"],
  mystic: ["Толкование карты", "Любовь и деньги", "Личный совет"],
  natal: ["Личные циклы", "Связь с Матрицей", "Ритуал недели"],
};

export function AphroditeLockedPreviewCard({
  variant = "general",
  scope,
  title = "VIP preview закрыт",
  subtitle = "Preview",
  preview = "Премиум-блок показан коротко. Без оплаты · VIP закрыт.",
  features,
  previewItems,
  lockLabel = "только preview",
  safetyLabel = "Без оплаты, без VIP-разблокировки, без обхода доступа.",
  className,
}: AphroditeLockedPreviewCardProps) {
  const featureList = features ?? defaultFeatures[variant];
  const previewList = previewItems ?? defaultPreviewItems[variant];

  return (
    <div
      className={aphroditeClassNames("aphrodite-pkg-267-mobile-webview-fix min-w-0", className)}
      data-aphrodite-vip-locked-preview-redesign="package-242"
      data-aphrodite-critical-mobile-webview-visual-fix="package-267"
      data-aphrodite-vip-locked-scope={scope ?? variant}
    >
      <AphroditeCard
        tone="locked"
        className={aphroditeClassNames(
          "aphrodite-pkg-267-card-fix relative overflow-hidden p-0",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-100 before:content-['']",
          variantAccent[variant],
        )}
      >
        <div className="relative min-w-0 space-y-3 p-2.5 min-[390px]:p-3">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap gap-2">
              <AphroditeBadge tone="locked">VIP preview</AphroditeBadge>
              <AphroditeBadge tone="gold">без оплаты</AphroditeBadge>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center self-start rounded-lg border border-amber-100/25 bg-black/25 text-amber-100">
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
            </span>
          </div>

          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase leading-4 text-amber-100/80">{subtitle}</p>
            <h3 className="aphrodite-pkg-267-text-fix break-words text-base font-semibold leading-6 text-[#fff7ed]">{title}</h3>
            <p className="aphrodite-pkg-267-text-fix line-clamp-2 break-words text-sm leading-5 text-slate-300">{preview}</p>
          </div>

          <div className="aphrodite-pkg-267-two-after-430 grid gap-2">
            {featureList.map((feature) => (
              <div key={feature} className="aphrodite-pkg-267-text-fix rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold leading-4 text-slate-100">
                {feature}
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            {previewList.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-amber-100/16 bg-black/18 px-2.5 py-1.5 text-xs leading-4 text-amber-50/90">
                <Sparkles aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-100" />
                <span className="aphrodite-pkg-267-text-fix break-words">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200/20 bg-emerald-200/10 px-2.5 py-2 text-xs leading-4 text-emerald-50">
            <div className="flex items-start gap-2">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-emerald-100" />
              <span className="aphrodite-pkg-267-text-fix">{safetyLabel}</span>
            </div>
            <div className="inline-flex w-fit max-w-full rounded-md border border-amber-100/20 bg-black/20 px-2 py-0.5 text-[11px] font-semibold uppercase leading-4 text-amber-100">
              <span className="aphrodite-pkg-267-text-fix">{lockLabel}</span>
            </div>
          </div>
        </div>
      </AphroditeCard>
    </div>
  );
}
