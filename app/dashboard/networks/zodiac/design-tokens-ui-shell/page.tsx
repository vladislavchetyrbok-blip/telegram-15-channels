import { CheckCircle2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AphroditeMiniAppShell } from "@/components/zodiac-mini-app/AphroditeMiniAppShell";
import { AphroditePrimaryCta } from "@/components/zodiac-mini-app/AphroditePrimaryCta";
import { AphroditeSectionCard } from "@/components/zodiac-mini-app/AphroditeSectionCard";
import { AphroditeStatusPill } from "@/components/zodiac-mini-app/AphroditeStatusPill";
import {
  APHRODITE_DESIGN_TOKENS_TITLE,
  getAphroditeMiniAppDesignTokens,
} from "@/lib/zodiac/aphrodite-design-tokens";

const tokens = getAphroditeMiniAppDesignTokens();

export const metadata = {
  title: APHRODITE_DESIGN_TOKENS_TITLE,
};

export default function AphroditeDesignTokensUiShellPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Layers3 className="h-4 w-4" />
            <span>Aphrodite / Design Tokens & UI Shell / Package 197</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_DESIGN_TOKENS_TITLE}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{tokens.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 197 добавляет общие design tokens и shell components для будущего упрощённого Mini App UI.
            Это визуальная основа без отправки данных, оплаты, VIP-разблокировки, Telegram API и записи в базу данных.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {tokens.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Metric label="spacing tokens" value={String(tokens.spacingScale.length)} />
          <Metric label="radius tokens" value={String(tokens.radiusScale.length)} />
          <Metric label="sendsAnythingNow" value={String(tokens.safetyFlags.sendsAnythingNow)} tone="rose" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ReviewSection title="token groups" icon={<Layers3 className="h-5 w-5 text-cyan-400" />}>
            <TokenList title="spacing scale" items={tokens.spacingScale.map((item) => `${item.name}: ${item.value} — ${item.usage}`)} />
            <TokenList title="radius scale" items={tokens.radiusScale.map((item) => `${item.name}: ${item.value} — ${item.usage}`)} />
            <TokenList title="section rhythm" items={tokens.sectionRhythm.map((item) => `${item.name}: ${item.value} — ${item.usage}`)} />
            <TokenList title="gradient usage rules" items={tokens.gradientUsageRules} />
            <TokenList title="Telegram safe area notes" items={tokens.telegramSafeAreaNotes} />
          </ReviewSection>

          <ReviewSection title="UI shell preview" icon={<Sparkles className="h-5 w-5 text-rose-300" />}>
            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <AphroditeMiniAppShell
                eyebrow="Package 197 preview"
                title="AI Love Reading"
                description="Shell skeleton показывает будущий rhythm: один главный CTA, secondary card и safe status."
                statusSlot={<AphroditeStatusPill label="UI shell ничего не отправляет" tone="safe" />}
                footerSlot={<AphroditeStatusPill label="Нет production-запуска" tone="safe" />}
              >
                <AphroditeSectionCard
                  tone="primary"
                  eyebrow="Primary module"
                  title="Главный продуктовый момент"
                  description="Карточка держит premium mystical style без лишнего визуального шума."
                >
                  <AphroditePrimaryCta href="/miniapp/love-reading-preview" icon={<Sparkles className="h-4 w-4" />}>
                    Открыть free preview
                  </AphroditePrimaryCta>
                </AphroditeSectionCard>
                <AphroditeSectionCard
                  tone="safe"
                  eyebrow="Safety"
                  title="Границы shell"
                  description="Компоненты ничего не отправляют и не меняют продуктовую логику."
                  actionSlot={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                />
              </AphroditeMiniAppShell>
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="safety flags" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(tokens.safetyFlags).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="break-words font-mono text-xs text-slate-500">{key}</div>
                <div className="mt-2 text-sm font-semibold text-emerald-300">{String(value)}</div>
              </div>
            ))}
          </div>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">План упрощённого Mini App UI</Link>
            <Link href="/miniapp" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mini App hub</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function TokenList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-400">
        {items.map((item) => (
          <li key={item} className="rounded-md border border-slate-800 bg-black/20 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
