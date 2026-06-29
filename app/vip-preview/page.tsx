import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, LockKeyhole, Sparkles } from "lucide-react";
import { AphroditeBadge, AphroditeLockedPreviewCard } from "@/components/zodiac-mini-app/aphrodite-design-system";
import { MOCK_VIP_PREVIEW_FEATURES } from "@/lib/zodiac/zodiac-vip-preview";

export const metadata: Metadata = {
  title: "VIP превью",
  description: "Короткое VIP превью без оплаты и без открытия доступа.",
};

const statusColors = {
  "preview-only": "border-violet-500/30 bg-violet-500/10 text-violet-400",
  "future": "border-slate-500/30 bg-slate-500/10 text-slate-400",
  "blocked-until-payments": "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

const statusLabels: Record<keyof typeof statusColors, string> = {
  "preview-only": "превью",
  future: "позже",
  "blocked-until-payments": "заблокировано",
};

export default function VipPreviewPage() {
  return (
    <div
      data-aphrodite-telegram-webview-mobile-polish="package-244"
      data-aphrodite-critical-mobile-webview-visual-fix="package-267"
      className="aphrodite-mobile-shell aphrodite-pkg-267-mobile-webview-fix zodiac-miniapp-safe-area flex flex-col bg-[#070b14] font-sans text-slate-100"
    >
      <header className="sticky top-0 z-10 border-b border-fuchsia-900/50 bg-[#070b14]/80 px-3 py-3 backdrop-blur-md min-[390px]:px-4">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/miniapp" className="aphrodite-touch-target rounded-full p-1 transition hover:bg-slate-800">
            <ChevronLeft className="h-6 w-6 text-slate-300" />
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-fuchsia-400" />
            <h1 className="aphrodite-pkg-267-text-fix text-lg font-semibold text-slate-100">VIP превью</h1>
          </div>
        </div>
      </header>

      <main className="aphrodite-scroll-safe aphrodite-safe-bottom mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-3 py-4 min-[390px]:px-4 min-[390px]:py-5">
        <section className="rounded-lg border border-fuchsia-200/20 bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.24),transparent_38%),rgba(15,23,42,0.74)] p-3 shadow-[0_18px_54px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-center gap-2">
            <AphroditeBadge tone="locked">Превью</AphroditeBadge>
            <AphroditeBadge tone="gold">Без оплаты</AphroditeBadge>
            <AphroditeBadge tone="violet">VIP закрыт</AphroditeBadge>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <Sparkles className="mt-1 h-6 w-6 shrink-0 text-fuchsia-300" />
            <div className="min-w-0">
              <h2 className="aphrodite-pkg-267-text-fix text-2xl font-semibold leading-8 text-white">VIP превью без оплаты</h2>
              <p className="mt-1 text-sm leading-5 text-slate-300">Полный VIP закрыт. Доступ не открывается.</p>
            </div>
          </div>
        </section>

        <div data-aphrodite-vip-preview-index="package-242">
          <AphroditeLockedPreviewCard
            variant="general"
            scope="vip-preview-index"
            title="VIP превью"
            subtitle="VIP закрыт"
            preview="Глубокий разбор показан коротко. Полный доступ не открывается."
            features={["Совместимость Pro", "Матрица Pro", "Mystic-чтение"]}
            previewItems={["Превью", "Без оплаты"]}
            safetyLabel="Без оплаты · VIP закрыт"
          />
        </div>

        <section className="grid grid-cols-1 gap-2">
          {MOCK_VIP_PREVIEW_FEATURES.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="min-w-0 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="aphrodite-wrap-anywhere font-semibold text-slate-200">{feature.title}</h3>
                </div>
                <p className="aphrodite-wrap-anywhere mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{feature.description}</p>
                
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[feature.status]}`}>
                    {statusLabels[feature.status]}
                  </span>
                </div>
              </div>
          ))}
        </section>

        <div className="border-t border-slate-800 pt-4">
            <h3 className="mb-3 text-sm font-medium text-slate-400">Быстрые переходы</h3>
            <div className="aphrodite-pkg-267-two-after-430 grid gap-2">
              <Link href="/compatibility" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Проверить совместимость
              </Link>
              <Link href="/birth-matrix" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Открыть Матрицу
              </Link>
              <Link href="/compatibility?startapp=mystic" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Мистические числа
              </Link>
              <Link href="/compatibility?startapp=mystic" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Аффирмации
              </Link>
            </div>
        </div>
      </main>
    </div>
  );
}
