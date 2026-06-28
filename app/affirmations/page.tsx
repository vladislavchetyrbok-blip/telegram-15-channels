import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Аффирмации",
  description: "Безопасный вход в актуальный Mini App preview.",
};

export default function AffirmationsPage() {
  return (
    <main
      data-aphrodite-package-275-public-mock-guard="affirmations"
      className="min-h-screen bg-[#070713] px-4 py-6 text-slate-100"
    >
      <section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-md flex-col justify-center">
        <div className="rounded-lg border border-white/12 bg-white/[0.06] p-4 shadow-[0_20px_70px_rgba(8,13,30,0.35)]">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-2.5 py-1 text-amber-100">Preview</span>
            <span className="rounded-full border border-rose-200/25 bg-rose-200/10 px-2.5 py-1 text-rose-100">Без оплаты</span>
            <span className="rounded-full border border-violet-200/25 bg-violet-200/10 px-2.5 py-1 text-violet-100">VIP закрыт</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold leading-8 text-white">Аффирмации</h1>
          <p className="mt-2 text-sm leading-5 text-slate-300">
            Старый demo-экран скрыт из public launch. Откройте актуальную Мистическую карту в Mini App.
          </p>
          <div className="mt-5 grid gap-2">
            <Link href="/compatibility?startapp=mystic" className="flex min-h-12 items-center justify-center rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white">
              Открыть Мистику
            </Link>
            <Link href="/miniapp" className="flex min-h-12 items-center justify-center rounded-lg border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-slate-100">
              Вернуться в Mini App
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
