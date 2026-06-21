import {
  Database,
  CheckCircle2,
  Lock,
  LockKeyhole,
  FileText,
  AlertCircle,
  Network,
  Activity,
  Rss,
  Coins,
  Bitcoin,
  Gem,
  Building2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

interface DataSource {
  id: string;
  name: string;
  icon: any;
  status: "active" | "draft" | "future";
  description: string;
}

const DATA_SOURCES: DataSource[] = [
  { id: "rss", name: "Ленты RSS", icon: Rss, status: "active", description: "Стандартные новостные ленты и блоги (мок-данные)." },
  { id: "currency", name: "API обмена валют", icon: Coins, status: "draft", description: "Курсы фиатных валют в реальном времени." },
  { id: "crypto", name: "Крипто API", icon: Bitcoin, status: "draft", description: "Цены на криптовалюты и рыночные данные." },
  { id: "metals", name: "API металлов", icon: Gem, status: "future", description: "Спотовые цены на драгоценные металлы." },
  { id: "realestate", name: "Парсер недвижимости", icon: Building2, status: "future", description: "Объявления о недвижимости и рыночные тренды." },
];

function StatusBadge({ status }: { status: DataSource["status"] }) {
  const styles = {
    active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    draft: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    future: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}

import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export default function AphroditeDataSourcesPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/data-sources");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <AphroditePageHeader
          title="Источники данных Афродиты"
          description="Режим только просмотра интеграций API, лент и парсеров для модулей платформы."
          badgeText="Источники данных"
          icon={Network}
          safetyLocked={false}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-400" />Реестр интеграций</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-[10px] font-medium text-slate-300 uppercase tracking-wider">Только просмотр</span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {DATA_SOURCES.map((source) => {
                  const Icon = source.icon;
                  return (
                    <div key={source.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-800/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/50 text-slate-300 shrink-0 mt-0.5">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-slate-200">{source.name}</h3>
                          </div>
                          <p className="text-[13px] text-slate-400 leading-relaxed max-w-md">
                            {source.description}
                          </p>
                        </div>
                      </div>
                      <div>
                        <StatusBadge status={source.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-rose-500/20 bg-[#0f1b33] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Lock className="h-24 w-24" />
              </div>
              <h2 className="text-base font-semibold text-rose-300 mb-5 flex items-center gap-2">
                <LockKeyhole className="h-5 w-5" />Безопасность источников</h2>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Нет активных ключей API на клиенте</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Нет внешних подключений</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Изоляция мок-данных активна</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 leading-tight">Синхронизация отключена для оператора</span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-800/80 bg-[#0f1b33] p-6 shadow-sm">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-400" />Статус подключения</h2>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">Все внешние источники данных работают в тестовом режиме.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
