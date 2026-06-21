import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ShieldAlert,
  Activity,
  Lock,
  Search,
  Zap,
  Terminal,
  FileText,
  Calendar,
  Eye
} from "lucide-react";
import Link from "next/link";
import { ZodiacManualReviewQueue } from "@/lib/zodiac/zodiac-manual-review-queue";

export default function ZodiacManualReviewPage() {
  const okCount = ZodiacManualReviewQueue.filter(q => q.queueStatus === "OK").length;
  const reviewCount = ZodiacManualReviewQueue.filter(q => q.queueStatus === "REVIEW").length;
  const blockedCount = ZodiacManualReviewQueue.filter(q => q.queueStatus === "BLOCKED").length;

  const checklistItems = [
    "dry-run прошёл",
    "ledger без ошибок",
    "нет дублей",
    "нет пропусков каналов",
    "качество текста не ниже целевого уровня",
    "CTA мягкий и безопасный",
    "Mini App-связка работает",
    "нет гарантированных предсказаний",
    "нет давления страхом",
    "владелец дал отдельное разрешение"
  ];

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Ручная проверка Зодиака</h1>
        <p className="text-slate-400 mt-2">
          Очередь ручного review перед soft launch: dry-run, ledger, качество, риски, CTA и разрешение владельца.
        </p>
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg text-sm text-blue-200 space-y-2">
          <p>Ручная проверка не останавливает уже настроенную ежедневную автоматику Зодиака. Она относится только к новым live-действиям, изменениям конфигурации и ручному допуску к расширению запуска.</p>
          <p>Существующий ежедневный контур продолжает работать как настроено. Эта страница только показывает статус review и риски.</p>
        </div>
      </div>

      {/* KPI Cards */}
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
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold text-white">Manual review</div>
        </div>
        <div className="rounded-xl border border-emerald-900/30 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">OK</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{okCount}</div>
        </div>
        <div className="rounded-xl border border-amber-900/30 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">REVIEW</h3>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{reviewCount}</div>
        </div>
        <div className="rounded-xl border border-rose-900/30 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">BLOCKED</h3>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{blockedCount}</div>
        </div>
        <div className="rounded-xl border border-rose-900/50 bg-[#0f1b33] p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-400">Live</h3>
            <Lock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-sm font-bold text-rose-500 mt-1">Заблокирован</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Review status explanation */}
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col md:col-span-1">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Статусы очереди</h3>
          </div>
          <div className="p-6 pt-4 space-y-4">
            <div className="space-y-1 border-l-2 border-emerald-500 pl-3">
              <h4 className="text-sm font-bold text-emerald-400">OK</h4>
              <p className="text-xs text-slate-400">Можно готовить к soft launch preview.</p>
              <p className="text-xs text-slate-500">Следующий шаг: Ожидание остальных каналов.</p>
            </div>
            <div className="space-y-1 border-l-2 border-amber-500 pl-3">
              <h4 className="text-sm font-bold text-amber-400">REVIEW</h4>
              <p className="text-xs text-slate-400">Нужен ручной просмотр.</p>
              <p className="text-xs text-slate-500">Следующий шаг: Пройти чеклист.</p>
            </div>
            <div className="space-y-1 border-l-2 border-rose-500 pl-3">
              <h4 className="text-sm font-bold text-rose-400">BLOCKED</h4>
              <p className="text-xs text-slate-400">Live запрещён.</p>
              <p className="text-xs text-slate-500">Следующий шаг: Исправление критических ошибок.</p>
            </div>
          </div>
        </div>

        {/* Manual checklist */}
        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col md:col-span-2">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white">Manual Checklist</h3>
          </div>
          <div className="p-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <div className="mt-0.5 rounded-full border border-slate-600 bg-slate-800 p-0.5">
                  <span className="sr-only">Check</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Block */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-rose-900/30 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-rose-900/30">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-rose-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Owner Approval Gate
            </h3>
          </div>
          <div className="p-6 pt-4 space-y-4">
            <p className="text-sm font-bold text-white">Live запрещён до отдельного разрешения владельца.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2 text-rose-400"><XCircle className="h-4 w-4" /> Ручное разрешение: не выдано</li>
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Telegram API: не вызывается</li>
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Публикация: заблокирована</li>
              <li className="flex items-center gap-2 text-slate-400"><Zap className="h-4 w-4" /> Следующий шаг: проверить queue после dry-run</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-800">
            <h3 className="font-semibold leading-none tracking-tight text-xl text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Safety Rules
            </h3>
          </div>
          <div className="p-6 pt-4">
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Live-публикация отключена</li>
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Telegram API не вызывается из этой страницы</li>
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Токены не используются</li>
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> UI только показывает очередь ручной проверки</li>
              <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Действующая ежедневная система не пересоздаётся</li>
              <li className="flex items-center gap-2 text-amber-500"><AlertTriangle className="h-4 w-4" /> Запуск только после отдельного разрешения</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Queue Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-white mt-8">Очередь 13 каналов</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ZodiacManualReviewQueue.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-[#0f1b33] shadow-sm flex flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{item.channelName}</h3>
                  <p className="text-xs text-slate-500">{item.channelSlug}</p>
                </div>
                <div>
                  {item.queueStatus === "OK" && <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">OK</span>}
                  {item.queueStatus === "REVIEW" && <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500">REVIEW</span>}
                  {item.queueStatus === "BLOCKED" && <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">BLOCKED</span>}
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Dry-run:</span>
                  <span className="text-slate-200">{item.dryRunStatus}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Ledger:</span>
                  <span className="text-slate-200">{item.ledgerStatus}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Quality target:</span>
                  <span className="text-slate-200">{item.qualityTarget}/100</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Preview review:</span>
                  <span className="text-amber-400">{item.previewReviewStatus}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Live:</span>
                  <span className="text-rose-400 font-bold">{item.liveStatus}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-slate-400">Риски:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.riskFlags.map((risk, i) => (
                      <span key={i} className="inline-flex items-center rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Следующий шаг:</span>
                  <p className="text-xs text-sky-400 mt-0.5">{item.nextAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross Links */}
      <div className="space-y-4 mt-8 pt-8 border-t border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white">Связанные модули</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/networks/zodiac/preview-review" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Eye className="h-4 w-4 text-sky-400" /> Preview Review</div>
            <div className="text-xs text-slate-400">Просмотр dry-run примеров</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/quality-scoring" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Quality Scoring</div>
            <div className="text-xs text-slate-400">Настройки оценки качества</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/ledger" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Terminal className="h-4 w-4 text-slate-400" /> Ledger</div>
            <div className="text-xs text-slate-400">Журнал публикаций</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/soft-launch" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Zap className="h-4 w-4 text-amber-400" /> Soft Launch</div>
            <div className="text-xs text-slate-400">Управление запуском</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/template-refinement" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><FileText className="h-4 w-4 text-indigo-400" /> Templates</div>
            <div className="text-xs text-slate-400">Редактирование шаблонов</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/content-quality" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><ShieldAlert className="h-4 w-4 text-rose-400" /> Content Quality</div>
            <div className="text-xs text-slate-400">Общие правила качества</div>
          </Link>
          <Link href="/dashboard/networks/zodiac/daily-system" className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2 text-white mb-1"><Activity className="h-4 w-4 text-blue-400" /> Daily System</div>
            <div className="text-xs text-slate-400">Ежедневный движок</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
