import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Eye,
  FileText,
  BarChart,
  ShieldAlert,
  Terminal,
  Activity,
  Zap,
  Lock,
  Search
} from "lucide-react";
import { ZodiacPreviewSamples } from "@/lib/zodiac/zodiac-preview-sample-review";

export default function ZodiacPreviewReviewPage() {
  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Preview Review Зодиака</h1>
        <p className="text-slate-400 mt-2">
          Ручной просмотр dry-run примеров: текст, структура, CTA, риски, оценка качества и готовность к soft launch.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Каналов</h3>
            <Activity className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">13</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Режим</h3>
            <Eye className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white">Preview review</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Источник</h3>
            <Terminal className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-sm font-bold mt-1 text-slate-300">Dry-run / preview</div>
        </div>
        <div className="rounded-xl border border-rose-900/50 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Live</h3>
            <Lock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-500">Заблокирован</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Scoring</h3>
            <BarChart className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">100 баллов</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Следующий этап</h3>
            <Zap className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-sm font-bold mt-1 text-slate-300">Ручная правка</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              Safety Rules
            </h3>
            <p className="text-sm text-slate-400">Правила безопасности Preview Review</p>
          </div>
          <div className="p-6 pt-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Live-публикация отключена
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Telegram API не вызывается из этой страницы
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Токены не используются
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> UI только показывает preview review
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Действующая ежедневная система не пересоздаётся
              </li>
              <li className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" /> Запуск только после отдельного разрешения
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Manual Review Workflow
            </h3>
            <p className="text-sm text-slate-400">Процесс работы с превью</p>
          </div>
          <div className="p-6 pt-4">
            <ol className="list-decimal pl-4 space-y-1 text-sm text-slate-300">
              <li>Запустить dry-run локально</li>
              <li>Открыть preview review</li>
              <li>Проверить 13 каналов</li>
              <li>Найти повторы и слабые CTA</li>
              <li>Проверить ledger</li>
              <li>Исправить шаблоны</li>
              <li>Повторить dry-run</li>
              <li>Live только после отдельного разрешения</li>
            </ol>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col md:col-span-2">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-sky-500" />
              Source Map
            </h3>
            <p className="text-sm text-slate-400">Источники данных для превью</p>
          </div>
          <div className="p-6 pt-4">
            <ul className="space-y-2 text-sm font-mono text-slate-300">
              <li className="flex items-center gap-2"><span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">dry-run command</span> npm run zodiac:publish:date:dry</li>
              <li className="flex items-center gap-2"><span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">ledger command</span> npm run zodiac:ledger:check</li>
              <li className="flex items-center gap-2"><span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">preview file</span> Требует проверки (используется вывод в stdout)</li>
              <li className="flex items-center gap-2"><span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">scoring rules</span> lib/zodiac/zodiac-quality-scoring.ts</li>
              <li className="flex items-center gap-2"><span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">template rules</span> lib/zodiac/generate-zodiac-plan.mjs</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-white mt-8">Санитизированные примеры по структуре dry-run</h2>
        
        {ZodiacPreviewSamples.map((sample) => (
          <div key={sample.id} className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold leading-none tracking-tight text-lg text-white">{sample.channelName} <span className="text-slate-400 text-sm font-normal">({sample.channelSlug})</span></h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">{sample.previewMode}</span>
                    <span className="text-rose-500 font-medium text-xs">Live Status: {sample.status === "Live заблокирован" ? "Заблокировано" : "На ручном просмотре"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${sample.qualityScore >= 90 ? 'text-emerald-400' : sample.qualityScore >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {sample.qualityScore}/100
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Оценка качества</div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 font-mono text-sm text-slate-300">
                    <div className="font-bold mb-2 text-white">{sample.title}</div>
                    <div className="whitespace-pre-wrap">{sample.textExcerpt}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sample.detectedStructure.map((block, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                        {block}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    {sample.safetyNote}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-200">Риски и Флаги:</h4>
                    {sample.riskFlags.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {sample.riskFlags.map((flag, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-rose-400">
                            <XCircle className="h-4 w-4 shrink-0" /> {flag}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Рисков не обнаружено
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-200">Разбивка оценки:</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Структура:</span>
                        <span className="font-mono text-slate-300">{sample.scoreBreakdown.structure}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Уникальность:</span>
                        <span className="font-mono text-slate-300">{sample.scoreBreakdown.signUniqueness}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">CTA:</span>
                        <span className="font-mono text-slate-300">{sample.scoreBreakdown.cta}/15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Безопасность:</span>
                        <span className="font-mono text-slate-300">{sample.scoreBreakdown.safety}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Повторяемость:</span>
                        <span className="font-mono text-slate-300">{sample.scoreBreakdown.repetition}/15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">TG-readiness:</span>
                        <span className="font-mono text-slate-300">{sample.scoreBreakdown.telegramReadiness}/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <h4 className="text-sm font-semibold mb-1 text-slate-200">Заметка ревьюера:</h4>
                    <p className="text-sm text-slate-400">{sample.manualReviewNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
