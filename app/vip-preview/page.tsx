import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ChevronLeft, LockKeyhole, Sparkles, Ban, ShieldCheck, Settings2, FileText, Database, CreditCard } from "lucide-react";
import { AphroditeLockedPreviewCard, AphroditeShareCard } from "@/components/zodiac-mini-app/aphrodite-design-system";
import { MOCK_VIP_PREVIEW_FEATURES, MOCK_VIP_BOUNDARY_RULES } from "@/lib/zodiac/zodiac-vip-preview";

export const metadata: Metadata = {
  title: "VIP Preview",
  description: "Preview shell for future VIP functionality.",
};

const statusColors = {
  "preview-only": "border-violet-500/30 bg-violet-500/10 text-violet-400",
  "future": "border-slate-500/30 bg-slate-500/10 text-slate-400",
  "blocked-until-payments": "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

const statusLabels: Record<keyof typeof statusColors, string> = {
  "preview-only": "preview",
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
            <h1 className="aphrodite-pkg-267-text-fix text-lg font-semibold text-slate-100">VIP preview</h1>
          </div>
        </div>
      </header>

      <main className="aphrodite-scroll-safe aphrodite-safe-bottom mx-auto flex w-full max-w-md flex-1 flex-col px-3 py-5 min-[390px]:px-4 min-[390px]:py-6">
        <div className="mb-6" data-aphrodite-vip-preview-index="package-242">
          <AphroditeLockedPreviewCard
            variant="general"
            scope="vip-preview-index"
            title="Будущий VIP-доступ"
            subtitle="Единый VIP preview"
            preview="Этот экран показывает ценность будущего премиум-слоя, но не запускает оплату, доступ, VIP-разблокировку или Telegram API."
            features={["Глубокая совместимость", "Матрица Pro", "Mystic-чтение"]}
            previewItems={["Natal профиль", "Личный совет", "Карточка результата"]}
            safetyLabel="Только preview: без оплаты, без VIP-доступа."
          />
        </div>

        <div className="mb-6" data-aphrodite-vip-preview-share-card="package-243">
          <AphroditeShareCard
            variant="vipPreview"
            scope="vip-preview"
            eyebrow="VIP teaser"
            title="Будущий VIP-доступ"
            subtitle="Премиум-результат в preview"
            scoreLabel="закрыто"
            scoreDetail="preview"
            insight="Премиум-карточка может показать будущую ценность VIP-чтения без оплаты, доступа, Telegram API или реальной разблокировки."
            highlights={[
              { label: "preview", value: "безопасно", detail: "Только визуальный teaser до любых будущих платежей." },
              { label: "граница", value: "закрыто", detail: "Без invoice, entitlement bypass, VIP-доступа и DB write." },
              { label: "формат", value: "mobile", detail: "Карточка для Telegram WebView 360px, 390px и 430px." },
            ]}
            footer="Визуальная VIP-карточка. Без отправки в Telegram, оплаты, invoice, entitlement change и DB write."
          />
        </div>

        <div className="mb-6 flex min-w-0 items-start gap-3 rounded-lg border border-amber-900/30 bg-amber-900/10 p-3 text-sm min-[390px]:p-4">
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500 mt-1" />
          <div className="min-w-0">
            <p className="aphrodite-pkg-267-text-fix text-base font-semibold text-amber-500">Только preview (Package 107)</p>
            <p className="aphrodite-pkg-267-text-fix mb-3 mt-1 text-xs text-amber-400/80">Статичная граница: оплата и реальный VIP-доступ не активны.</p>
            <ul className="space-y-1.5 text-xs text-amber-500/90">
              {MOCK_VIP_BOUNDARY_RULES.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Ban className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
                  <span className="aphrodite-wrap-anywhere"><span className="font-semibold">{rule.label}:</span> {rule.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6 flex min-w-0 items-start gap-3 rounded-lg border border-indigo-900/30 bg-indigo-900/10 p-3 text-sm min-[390px]:p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" />
          <div className="min-w-0">
            <p className="aphrodite-pkg-267-text-fix font-medium text-indigo-300">VIP Access Boundary есть, но реальная VIP-разблокировка не активна.</p>
            <Link href="/dashboard/networks/zodiac/vip-access-boundary" className="aphrodite-touch-target aphrodite-wrap-anywhere text-indigo-400 hover:text-indigo-300 underline underline-offset-4 text-xs mt-2 inline-flex items-center">
              Открыть VIP Access Boundary
            </Link>
          </div>
        </div>

        <div className="mb-6 flex min-w-0 items-start gap-3 rounded-lg border border-violet-900/30 bg-violet-900/10 p-3 text-sm min-[390px]:p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-violet-400 mt-0.5" />
          <div className="min-w-0">
            <p className="aphrodite-pkg-267-text-fix font-medium text-violet-300">Фундамент VIP Compatibility Deep Report есть, но оплата и реальная VIP-разблокировка не активны.</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="aphrodite-touch-target aphrodite-wrap-anywhere text-violet-400 hover:text-violet-300 underline underline-offset-4 text-xs inline-flex items-center">
                VIP Compatibility Report Foundation
              </Link>
              <Link href="/vip-compatibility-report" className="aphrodite-touch-target aphrodite-wrap-anywhere text-violet-400 hover:text-violet-300 underline underline-offset-4 text-xs inline-flex items-center font-medium">
                Открыть report preview
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-fuchsia-400 mb-3" />
            <h2 className="aphrodite-pkg-267-text-fix text-2xl font-bold text-slate-100">Будущий VIP-доступ</h2>
            <p className="aphrodite-pkg-267-text-fix mt-2 text-sm text-slate-400">Preview расширенных функций для будущих обновлений.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {MOCK_VIP_PREVIEW_FEATURES.map((feature, idx) => (
              <div key={idx} className="min-w-0 rounded-lg border border-slate-800 bg-slate-900/50 p-3 min-[390px]:p-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="aphrodite-wrap-anywhere font-semibold text-slate-200">{feature.title}</h3>
                </div>
                <p className="aphrodite-wrap-anywhere text-sm text-slate-400 mt-1.5 leading-relaxed">{feature.description}</p>
                
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[feature.status]}`}>
                    {statusLabels[feature.status]}
                  </span>
                  <span className="aphrodite-wrap-anywhere text-[10px] text-slate-500 flex items-center gap-1">
                    <Settings2 className="h-3 w-3" /> {feature.dependency}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Future Dependencies Block */}
          <div className="min-w-0 rounded-lg border border-indigo-900/30 bg-indigo-900/10 p-3 min-[390px]:p-5">
            <h3 className="aphrodite-wrap-anywhere font-semibold text-indigo-400 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Будущие зависимости
            </h3>
            <ul className="grid grid-cols-1 gap-2 text-sm text-slate-300">
              <li className="aphrodite-wrap-anywhere flex items-center gap-2"><CreditCard className="h-4 w-4 text-indigo-500/70" /> Платежный провайдер</li>
              <li className="aphrodite-wrap-anywhere flex items-center gap-2"><Database className="h-4 w-4 text-indigo-500/70" /> Хранение профиля</li>
              <li className="aphrodite-wrap-anywhere flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-indigo-500/70" /> Entitlement model</li>
              <li className="aphrodite-wrap-anywhere flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500/70" /> Privacy policy и refund rules</li>
              <li className="aphrodite-wrap-anywhere flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-500/70" /> Production security review</li>
            </ul>
          </div>

          {/* Safe Next Steps Block */}
          <div className="min-w-0 rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-3 min-[390px]:p-5">
            <h3 className="aphrodite-wrap-anywhere font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Безопасный roadmap
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>Спроектировать entitlement model.</li>
              <li>Спроектировать payment boundary.</li>
              <li>Спроектировать хранение профиля.</li>
              <li>Спроектировать privacy и refund/access rules.</li>
              <li className="aphrodite-wrap-anywhere font-medium text-emerald-300 mt-3 pt-3 border-t border-emerald-900/50">
                Только после этого реализовывать реальную VIP-логику отдельным пакетом.
              </li>
            </ol>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h3 className="mb-3 text-sm font-medium text-slate-400">Быстрые переходы</h3>
            <div className="aphrodite-pkg-267-two-after-430 grid gap-2">
              <Link href="/compatibility" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Проверить совместимость
              </Link>
              <Link href="/birth-matrix" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Открыть Матрицу
              </Link>
              <Link href="/mystic-numbers" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Мистические числа
              </Link>
              <Link href="/affirmations" className="aphrodite-touch-target aphrodite-wrap-anywhere flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Аффирмации
              </Link>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800 pb-8">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Навигация</h3>
            <div className="flex flex-col gap-3">
              <Link href="/miniapp" className="text-sm font-bold text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
                ← Назад в Mini App
              </Link>
              <Link href="/dashboard/networks/zodiac/miniapp-route-safety" className="text-xs text-emerald-500/80 hover:text-emerald-400 transition flex items-center gap-1 mt-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Safety baseline
              </Link>
              <Link href="/dashboard/networks/zodiac/miniapp-architecture" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                → Mini App Architecture
              </Link>
              <Link href="/dashboard/networks/zodiac/stability" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                → Stability Matrix
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
