import React from 'react';
import Link from 'next/link';
import { AlertCircle, Lock, LayoutTemplate, Zap, MessageCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { ZodiacTemplateRules } from '@/lib/zodiac/zodiac-template-refinement';

export default function TemplateRefinementPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-black min-h-screen text-slate-200">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">Шаблоны Зодиака</h1>
          <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 transition-colors">
            Workbench
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          Рабочая зона улучшения шаблонов: структура поста, различия знаков, CTA, Mini App-связка, повторяемость и безопасные формулировки.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Правила повторов</h3>
            <LayoutTemplate className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">{ZodiacTemplateRules.repetitionRules.length}</div>
          <p className="text-xs text-slate-500 mt-1">Критериев качества</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Mini App Hooks (CTA)</h3>
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{ZodiacTemplateRules.goodCTAs.length}</div>
          <p className="text-xs text-slate-500 mt-1">Интеграций Mini App</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Охват знаков</h3>
            <MessageCircle className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">12/12</div>
          <p className="text-xs text-slate-500 mt-1">Знаков персонализировано</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Публикация</h3>
            <Lock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-500">Local</div>
          <p className="text-xs text-slate-500 mt-1">Без вызова API Telegram</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Структура поста</h3>
            <p className="text-sm text-slate-400">Скелет типового гороскопа</p>
          </div>
          <div className="p-6 pt-4 flex-1">
            <div className="space-y-4">
              {ZodiacTemplateRules.structure.map((block, index) => (
                <div key={index} className="flex gap-4 items-start p-3 bg-slate-900 rounded-lg border border-slate-800/50">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{block.block}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{block.purpose}</p>
                    <div className="mt-2 text-xs">
                      <span className="text-emerald-400 mr-2">✓ {block.goodPattern}</span>
                      <br/>
                      <span className="text-rose-400 mr-2">✗ {block.badPattern}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Mini App CTA (Призывы к действию)</h3>
            <p className="text-sm text-slate-400">Интеграция с ботом и Mini App без агрессии</p>
          </div>
          <div className="p-6 pt-4 flex-1">
            <div className="space-y-3">
              {ZodiacTemplateRules.goodCTAs.map((cta, index) => (
                <div key={index} className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-400/90 text-sm">
                  {cta}
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Ограничения по CTA
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 list-disc pl-5">
                {ZodiacTemplateRules.badCTAs.map((cta, index) => (
                   <li key={index} className="text-rose-300 line-through">{cta}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
          <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Якоря Знаков (Дифференциация)</h3>
          <p className="text-sm text-slate-400">Ключевые слова и фокус для каждого знака, чтобы избежать однотипных текстов.</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ZodiacTemplateRules.signAnchors.map((data, idx) => (
              <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                <h4 className="font-semibold text-slate-200 capitalize mb-2">{data.sign}</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">Фокус</span>
                    <span className="text-xs text-indigo-300">{data.accent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 mt-6">
        <Link href="/dashboard/networks/zodiac/quality-scoring" className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5 shadow-sm hover:bg-sky-500/20 transition flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-lg font-semibold text-white">Оценка качества</h3>
            </div>
            <div className="text-sm text-sky-300">Scoring перед soft launch: структура, CTA, безопасность, повторяемость и различимость знаков.</div>
          </div>
          <div className="flex items-center justify-center p-2 rounded-full bg-slate-800/50">
            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </Link>
      </div>

      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 shadow-sm flex flex-col mt-6">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold leading-none tracking-tight text-lg text-rose-400">Правила безопасности шаблонов</h3>
          </div>
        </div>
        <div className="p-6 pt-0">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-rose-200/80">
            {ZodiacTemplateRules.repetitionRules.map((rule, idx) => (
              <li key={idx} className="flex gap-2 items-start bg-rose-950/40 p-3 rounded-lg border border-rose-900/30">
                <span className="shrink-0 text-rose-500 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
