"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { AphroditeLockedPreviewCard, AphroditeShareCard } from "@/components/zodiac-mini-app/aphrodite-design-system";
import { createVipCompatibilityReportMock } from "@/lib/zodiac/zodiac-vip-compatibility-report-foundation";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function VipCompatibilityReportClient() {
  const [firstSign, setFirstSign] = useState<string>("Aries");
  const [secondSign, setSecondSign] = useState<string>("Libra");
  const [firstName, setFirstName] = useState<string>("");
  const [secondName, setSecondName] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState(false);

  const mockReport = isGenerated ? createVipCompatibilityReportMock({
    firstSign,
    secondSign,
    firstName: firstName || undefined,
    secondName: secondName || undefined,
  }) : null;

  return (
    <div className="min-w-0 max-w-full space-y-5 min-[390px]:space-y-6">
      <div className="min-w-0 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm shadow-sm min-[390px]:p-4">
        <h2 className="aphrodite-wrap-anywhere flex items-center gap-2 font-semibold text-rose-300 mb-2">
          <ShieldAlert className="h-5 w-5" />
          Preview: без оплаты и без VIP-разблокировки
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-rose-200/80">
          <li>Нет payment handler</li>
          <li>Нет Telegram Stars integration</li>
          <li>Нет изменений active Telegram CTA</li>
          <li>Нет route gating</li>
          <li>Нет записи в базу</li>
          <li>Нет вызова Telegram API</li>
          <li>Нет production launch</li>
        </ul>
      </div>

      {!isGenerated ? (
        <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900/60 p-3 shadow-sm min-[390px]:p-6">
          <h2 className="aphrodite-wrap-anywhere text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-400" />
            Preview-расчет
          </h2>
          <div className="aphrodite-pkg-267-two-after-430 mb-6 grid gap-3 min-[390px]:gap-6">
            <div className="min-w-0 space-y-4 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3 min-[390px]:p-4">
              <h3 className="aphrodite-wrap-anywhere font-semibold text-slate-200">Первый человек</h3>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Знак</label>
                <select 
                  className="aphrodite-touch-target w-full rounded border border-slate-700 bg-slate-800 p-2 text-[16px] text-slate-200 focus:border-fuchsia-500/50 focus:outline-none"
                  value={firstSign}
                  onChange={(e) => setFirstSign(e.target.value)}
                >
                  {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Имя (необязательно)</label>
                <input 
                  type="text" 
                  className="aphrodite-touch-target w-full rounded border border-slate-700 bg-slate-800 p-2 text-[16px] text-slate-200 focus:border-fuchsia-500/50 focus:outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                />
              </div>
            </div>
            
            <div className="min-w-0 space-y-4 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3 min-[390px]:p-4">
              <h3 className="aphrodite-wrap-anywhere font-semibold text-slate-200">Второй человек</h3>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Знак</label>
                <select 
                  className="aphrodite-touch-target w-full rounded border border-slate-700 bg-slate-800 p-2 text-[16px] text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                  value={secondSign}
                  onChange={(e) => setSecondSign(e.target.value)}
                >
                  {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Имя (необязательно)</label>
                <input 
                  type="text" 
                  className="aphrodite-touch-target w-full rounded border border-slate-700 bg-slate-800 p-2 text-[16px] text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  placeholder="e.g. Jordan"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsGenerated(true)}
            className="aphrodite-touch-target aphrodite-wrap-anywhere w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-3 py-3 text-center font-semibold text-white shadow-md transition-all hover:from-fuchsia-500 hover:to-indigo-500"
          >
              Показать preview
          </button>
        </div>
      ) : (
        <div className="min-w-0 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 min-[390px]:space-y-6">
          <button 
            onClick={() => setIsGenerated(false)}
            className="aphrodite-touch-target aphrodite-wrap-anywhere text-left text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            ← Back to selection
          </button>

          <div className="min-w-0 overflow-hidden rounded-lg border border-fuchsia-900/30 bg-slate-900 shadow-xl">
            <div className="border-b border-slate-800 bg-gradient-to-b from-fuchsia-900/40 to-slate-900 p-4 text-center min-[390px]:p-8">
              <Heart className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h1 className="aphrodite-wrap-anywhere text-2xl font-bold text-white mb-3 min-[390px]:text-3xl">{mockReport!.headline}</h1>
              <p className="aphrodite-wrap-anywhere text-slate-300 max-w-2xl mx-auto">{mockReport!.summary}</p>
            </div>

            <div className="p-3 pb-0 min-[390px]:p-6 min-[390px]:pb-0" data-aphrodite-vip-compatibility-share-card="package-243">
              <AphroditeShareCard
                variant="vipPreview"
                scope="vip-compatibility-report"
                eyebrow="VIP compatibility teaser"
                title={mockReport!.headline}
                subtitle={`${firstSign} + ${secondSign}`}
                scoreLabel="preview"
                scoreDetail="закрыто"
                insight={mockReport!.summary}
                highlights={[
                  { label: "отчет", value: "teaser", detail: "Показывает форму премиум-результата без открытия VIP-секций." },
                  { label: "граница", value: "безопасно", detail: mockReport!.vipBoundaryNote },
                  { label: "шэринг", value: "визуально", detail: "Только preview: без Telegram send API, invoice и DB write." },
                ]}
                footer="VIP-карточка только в preview. Без оплаты, Telegram invoice, обхода доступа и VIP-разблокировки."
              />
            </div>

            <div className="space-y-4 p-3 min-[390px]:space-y-6 min-[390px]:p-6">
              {mockReport!.sections.map((section, idx) => (
                <div key={idx} className={`min-w-0 rounded-lg border ${section.previewLevel === 'free-preview' ? 'bg-slate-800/50 border-slate-700 p-3 min-[390px]:p-6' : 'bg-slate-950/80 border-indigo-900/30 p-3 min-[390px]:p-6 relative overflow-hidden'}`}>
                  {section.previewLevel === 'future-vip' && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 p-3 text-center backdrop-blur-sm min-[390px]:p-5">
                        <AphroditeLockedPreviewCard
                          variant="compatibility"
                          scope="vip-compatibility-report"
                          title={section.title}
                          subtitle="VIP-секция закрыта"
                          preview="Будущая VIP-секция здесь не открывается. Сейчас это только preview."
                          features={["Разбор совместимости", "Календарь пары", "Карточка результата"]}
                          previewItems={["Нужен будущий entitlement", "Нужна будущая платежная интеграция", "Сейчас без оплаты"]}
                          safetyLabel="Без payment handler, без Telegram Stars, без VIP-разблокировки."
                          className="w-full max-w-full text-left"
                        />
                      </div>
                  )}

                  <div className={section.previewLevel === 'future-vip' ? 'opacity-20 pointer-events-none blur-[2px]' : ''}>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <h3 className="aphrodite-wrap-anywhere text-xl font-semibold text-fuchsia-100">{section.title}</h3>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        Free Preview
                      </span>
                    </div>
                    <p className="aphrodite-wrap-anywhere text-slate-300 leading-relaxed mb-4">{section.text}</p>
                    <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 min-[390px]:p-4">
                      <p className="text-sm font-medium text-amber-200/90 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="aphrodite-wrap-anywhere">{section.practicalHint}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex min-w-0 items-start gap-3 border-t border-rose-900/30 bg-rose-950/30 p-3 text-sm text-rose-300/80 min-[390px]:p-6">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="aphrodite-wrap-anywhere min-w-0">
                  <strong>Safety:</strong> {mockReport!.vipBoundaryNote}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/miniapp" className="aphrodite-touch-target aphrodite-wrap-anywhere inline-flex items-center text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
          Mini App Home
        </Link>
        <Link href="/compatibility" className="aphrodite-touch-target aphrodite-wrap-anywhere inline-flex items-center text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Бесплатная совместимость
        </Link>
          <Link href="/vip-preview" className="aphrodite-touch-target aphrodite-wrap-anywhere inline-flex items-center text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            VIP preview
        </Link>
        <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="aphrodite-touch-target aphrodite-wrap-anywhere inline-flex items-center text-slate-400 hover:text-slate-300 underline underline-offset-4">
          Dashboard: Report Foundation
        </Link>
        <Link href="/dashboard/networks/zodiac/vip-access-boundary" className="aphrodite-touch-target aphrodite-wrap-anywhere inline-flex items-center text-slate-400 hover:text-slate-300 underline underline-offset-4">
          Dashboard: VIP Boundary
        </Link>
      </div>
    </div>
  );
}
