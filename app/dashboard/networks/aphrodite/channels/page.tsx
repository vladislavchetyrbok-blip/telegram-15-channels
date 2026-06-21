import React from 'react';
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { Server, Activity, PauseCircle, FileText, CheckCircle2, AlertCircle, RadioTower } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

type ChannelStatus = 'пауза' | 'черновик' | 'активен' | 'требует уточнения';
type Language = 'RU' | 'UA' | 'mixed' | 'unknown';

interface ChannelRegistryItem {
  id: string;
  name: string;
  network: string;
  module: string;
  category: string;
  language: Language;
  status: ChannelStatus;
  contentFormat: string;
  publishFrequency: string;
  nextStep: string;
  safetyNote: string;
}

const registry: ChannelRegistryItem[] = [
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `legacy-general-${i + 1}`,
    name: `Общая тема ${String(i + 1).padStart(2, '0')} (требует уточнения)`,
    network: 'Старая сеть 15 каналов',
    module: 'Legacy',
    category: 'Общие темы',
    language: 'unknown' as Language,
    status: 'требует уточнения' as ChannelStatus,
    contentFormat: 'Требует уточнения',
    publishFrequency: 'Пауза',
    nextStep: 'Найти точное название в истории',
    safetyNote: 'No live publish from registry',
  })),
  ...['Днепр 01', 'Днепр 02', 'Украина 01', 'Украина 02', 'зарубежная 01'].map((loc, i) => ({
    id: `legacy-realestate-${i + 1}`,
    name: `Недвижимость ${loc} (требует уточнения)`,
    network: 'Старая сеть 15 каналов',
    module: 'Legacy',
    category: 'Недвижимость',
    language: 'unknown' as Language,
    status: 'требует уточнения' as ChannelStatus,
    contentFormat: 'Требует уточнения',
    publishFrequency: 'Пауза',
    nextStep: 'Найти точное название в истории',
    safetyNote: 'No live publish from registry',
  })),

  ...['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы', 'Общий канал Зодиака'].map((sign, i) => ({
    id: `zodiac-${i + 1}`,
    name: sign,
    network: 'Каналы Зодиака',
    module: 'Зодиак',
    category: sign === 'Общий канал Зодиака' ? 'Общий' : 'Знак зодиака',
    language: 'mixed' as Language,
    status: 'черновик' as ChannelStatus,
    contentFormat: 'Текст / Гороскоп',
    publishFrequency: 'Ежедневно (draft)',
    nextStep: 'Интеграция контент-движка',
    safetyNote: 'No live publish from registry',
  })),

  ...['daily rates', 'intraday', 'digest'].map((cat, i) => ({
    id: `currency-${i + 1}`,
    name: `Валюты - ${cat}`,
    network: 'Валюты',
    module: 'Валюты',
    category: cat,
    language: 'RU' as Language,
    status: 'черновик' as ChannelStatus,
    contentFormat: 'Сводка / График',
    publishFrequency: 'TBD',
    nextStep: 'Разработка MVP',
    safetyNote: 'Draft network',
  })),

  ...['top-10', 'market snapshot', 'risk disclaimer'].map((cat, i) => ({
    id: `crypto-${i + 1}`,
    name: `Крипта - ${cat}`,
    network: 'Крипта',
    module: 'Крипта',
    category: cat,
    language: 'RU' as Language,
    status: 'черновик' as ChannelStatus,
    contentFormat: 'Аналитика / Дашборд',
    publishFrequency: 'TBD',
    nextStep: 'Разработка MVP',
    safetyNote: 'Draft network',
  })),

  ...['precious metals', 'industrial metals', 'daily watch'].map((cat, i) => ({
    id: `metals-${i + 1}`,
    name: `Металлы - ${cat}`,
    network: 'Металлы',
    module: 'Металлы',
    category: cat,
    language: 'RU' as Language,
    status: 'черновик' as ChannelStatus,
    contentFormat: 'Сводка цен',
    publishFrequency: 'TBD',
    nextStep: 'Разработка MVP',
    safetyNote: 'Draft network',
  })),
];

export default function AphroditeChannelRegistryPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/channels");

  const networks = [
    { name: 'Старая сеть 15 каналов', channels: registry.filter(c => c.network === 'Старая сеть 15 каналов') },
    { name: 'Каналы Зодиака', channels: registry.filter(c => c.network === 'Каналы Зодиака') },
    { name: 'Валюты', channels: registry.filter(c => c.network === 'Валюты') },
    { name: 'Крипта', channels: registry.filter(c => c.network === 'Крипта') },
    { name: 'Металлы', channels: registry.filter(c => c.network === 'Металлы') },
  ];

  const totalChannels = registry.length;
  const legacyCount = registry.filter(c => c.network === 'Старая сеть 15 каналов').length;
  const zodiacCount = registry.filter(c => c.network === 'Каналы Зодиака').length;
  const draftNetworksCount = registry.filter(c => ['Валюты', 'Крипта', 'Металлы'].includes(c.network)).length;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <AphroditePageHeader
          title="Реестр Каналов Афродиты"
          description="Единый реестр всех сетей и каналов, управляемых платформой Афродита."
          badgeText="Реестр сетей"
          icon={Server}
          safetyLocked={true}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-qa="visual-summary">
          <SummaryMetric label="Всего каналов в реестре" value={totalChannels} tone="blue" />
          <SummaryMetric label="Старая сеть 15 каналов" value={legacyCount} tone="slate" />
          <SummaryMetric label="Каналы Зодиака" value={zodiacCount} tone="amber" />
          <SummaryMetric label="Каналы новых модулей (Draft)" value={draftNetworksCount} tone="emerald" />
        </div>

        <div className="space-y-12">
          {networks.map((net) => (
            <section key={net.name}>
              <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <RadioTower className="h-6 w-6 text-blue-500" />
                  {net.name} — {net.channels.length} {net.channels.length === 15 ? 'каналов' : net.channels.length === 13 ? 'каналов' : 'каналов/рубрик'}
                </h2>
                {net.name === 'Старая сеть 15 каналов' && (
                  <span className="rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                    Общие темы — 10 | Недвижимость — 5
                  </span>
                )}
                {net.name === 'Каналы Зодиака' && (
                  <span className="rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                    Зодиак модуль
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {net.channels.map((channel) => (
                  <div key={channel.id} className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm transition hover:border-blue-500/30 hover:bg-slate-800/50">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                          {channel.name}
                        </h3>
                        <StatusBadge status={channel.status} />
                      </div>
                      
                      <div className="space-y-3 text-sm text-slate-400">
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2 items-center">
                          <span className="text-slate-500 text-xs uppercase tracking-wider">Модуль</span>
                          <span className="text-slate-300">{channel.module}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2 items-center">
                          <span className="text-slate-500 text-xs uppercase tracking-wider">Категория</span>
                          <span className="text-slate-300">{channel.category}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2 items-center">
                          <span className="text-slate-500 text-xs uppercase tracking-wider">Язык</span>
                          <span className="text-slate-300">{channel.language}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2 items-center">
                          <span className="text-slate-500 text-xs uppercase tracking-wider">Формат</span>
                          <span className="text-slate-300">{channel.contentFormat}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2 items-center">
                          <span className="text-slate-500 text-xs uppercase tracking-wider">Частота</span>
                          <span className="text-slate-300">{channel.publishFrequency}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_1.5fr] gap-2 items-center">
                          <span className="text-slate-500 text-xs uppercase tracking-wider">След. шаг</span>
                          <span className="text-amber-400/80">{channel.nextStep}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 border-t border-slate-800/80 pt-4">
                      <div className="flex items-start gap-2 text-xs">
                        {channel.status === 'требует уточнения' || channel.status === 'пауза' ? (
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/80" />
                        ) : (
                          <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400/80" />
                        )}
                        <span className={channel.status === 'требует уточнения' || channel.status === 'пауза' ? 'text-rose-400/80' : 'text-blue-400/80'}>
                          {channel.safetyNote}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: number | string; tone: "blue" | "slate" | "amber" | "emerald" | "rose" }) {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ChannelStatus }) {
  const colors = {
    "пауза": "bg-slate-500/10 text-slate-400 border-slate-500/30",
    "черновик": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "активен": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "требует уточнения": "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${colors[status]}`}>
      {status}
    </span>
  );
}