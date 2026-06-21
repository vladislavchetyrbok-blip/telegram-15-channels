import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Target, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Ban, ArrowRight, LayoutTemplate, Zap, MessageCircle, Eye } from 'lucide-react';
import { ZodiacQualityScoring } from '@/lib/zodiac/zodiac-quality-scoring';

export default function QualityScoringPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-black min-h-screen text-slate-200">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">Оценка качества Зодиака</h1>
          <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 transition-colors">
            Quality Scoring
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          Scoring перед soft launch: структура, уникальность знаков, CTA, безопасность формулировок, повторяемость и готовность к публикации.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Каналов</h3>
            <Target className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">13</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Режим</h3>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-indigo-400 mt-1">Quality scoring</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Максимум</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">100 баллов</div>
        </div>
        <div className="rounded-xl border border-rose-900/50 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Live</h3>
            <Ban className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-500 mt-1">Заблокирован</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Источник</h3>
            <LayoutTemplate className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-xs font-bold text-slate-300 mt-2">Действующая ежедневная система</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Следующий этап</h3>
            <ArrowRight className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-amber-400 mt-1">Ручной просмотр</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Модель оценки</h3>
            <p className="text-sm text-slate-400">6 критериев качества контента (100 баллов)</p>
          </div>
          <div className="p-6 pt-4 flex-1">
            <div className="space-y-4">
              {ZodiacQualityScoring.categories.map((cat, index) => (
                <div key={index} className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-200">{cat.name}</h4>
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded font-bold">{cat.maxPoints} баллов</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{cat.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-start gap-2 text-emerald-400/90">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{cat.goodSignal}</span>
                    </div>
                    <div className="flex items-start gap-2 text-amber-400/90">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{cat.warningSignal}</span>
                    </div>
                    <div className="flex items-start gap-2 text-rose-400/90">
                      <Ban className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{cat.blockingSignal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
              <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Preview статусов по каналам</h3>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-400" />
                Модель оценки / требует проверки на реальных dry-run постах
              </p>
            </div>
            <div className="p-6 pt-4 overflow-y-auto max-h-[500px]">
              <div className="space-y-2">
                {ZodiacQualityScoring.channelsPreview.map((channel, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 bg-slate-900 border border-slate-800/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-200 text-sm">{channel.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Якорь: {channel.anchor}</p>
                      <p className="text-[11px] text-amber-500/80">Риск: {channel.risk}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs font-bold ${channel.targetScore.startsWith('5') || channel.targetScore.startsWith('6') ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {channel.targetScore}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        channel.status === 'Готовить к ручному просмотру' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        channel.status === 'Проверить через dry-run' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {channel.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
              <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Флаги рисков (Risk flags)</h3>
              <p className="text-sm text-slate-400">Автоматические триггеры блокировки или ревью</p>
            </div>
            <div className="p-6 pt-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold text-rose-400 mb-1">BLOCKED (Блокировка 100%)</div>
                  {ZodiacQualityScoring.riskFlags.filter(f => f.severity === 'BLOCKED').map((flag, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-rose-200/80 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                      <Ban className="h-3 w-3 text-rose-500" />
                      <span>{flag.flag} <span className="text-rose-500/50">- {flag.description}</span></span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="text-xs font-semibold text-amber-400 mb-1">REVIEW (Требует проверки)</div>
                  {ZodiacQualityScoring.riskFlags.filter(f => f.severity === 'REVIEW').map((flag, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-amber-200/80 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <span>{flag.flag} <span className="text-amber-500/50">- {flag.description}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Чеклист ручного ревью</h3>
            <p className="text-sm text-slate-400">Для проверки перед публикацией</p>
          </div>
          <div className="p-6 pt-4">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">1.</span> текст короткий;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">2.</span> знак узнаётся;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">3.</span> нет давления страхом;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">4.</span> нет гарантий;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">5.</span> есть мягкий CTA;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">6.</span> Mini App упомянут аккуратно;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">7.</span> любовь/деньги/совет не повторяют соседние знаки;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">8.</span> аффирмация не одинаковая;</li>
              <li className="flex gap-3 items-start"><span className="text-indigo-400 font-bold">9.</span> пост подходит для Telegram.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Связанные инструменты</h3>
            <p className="text-sm text-slate-400">Экосистема Зодиака</p>
          </div>
          <div className="p-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/dashboard/networks/zodiac/template-refinement" className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3">
                <LayoutTemplate className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium">Шаблоны</span>
              </Link>
              <Link href="/dashboard/networks/zodiac/content-quality" className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium">Качество контента</span>
              </Link>
              <Link href="/dashboard/networks/zodiac/ledger" className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">Ledger</span>
              </Link>
              <Link href="/dashboard/networks/zodiac/soft-launch" className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3">
                <Target className="h-4 w-4 text-rose-400" />
                <span className="text-sm font-medium">Soft Launch</span>
              </Link>
              <Link href="/dashboard/networks/zodiac/daily-system" className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Ежедневная система генерации</span>
              </Link>
              <Link href="/dashboard/networks/zodiac/preview-review" className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-3">
                <Eye className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium">Preview Review</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 shadow-sm flex flex-col mt-8">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold leading-none tracking-tight text-lg text-rose-400">Песочница и безопасность</h3>
          </div>
        </div>
        <div className="p-6 pt-0">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-rose-200/80">
            <li className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              <span>Live-публикация отключена</span>
            </li>
            <li className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              <span>Telegram API не вызывается из этой страницы</span>
            </li>
            <li className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              <span>Токены не используются</span>
            </li>
            <li className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              <span>UI только показывает модель оценки качества</span>
            </li>
            <li className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              <span>Действующая ежедневная система не пересоздаётся</span>
            </li>
            <li className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
              <span className="shrink-0 text-rose-500 font-bold">•</span>
              <span>Запуск только после отдельного разрешения</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
