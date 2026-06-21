import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { Activity, RadioTower, CheckCircle2, LockKeyhole, FileText, Smartphone } from "lucide-react";
import React from "react";

export const dynamic = "force-dynamic";

const generalChannels = [
  { name: "Ідеї для бізнесу", profile: "сервисные идеи, проверка спроса, малый бизнес, ниши.", language: "UA" },
  { name: "Мужской стиль и вещи", profile: "мужской стиль, одежда, вещи, осознанные покупки.", language: "RU" },
  { name: "Техника для дома", profile: "бытовая техника, выбор без переплаты, практичные покупки.", language: "RU" },
  { name: "Україна: можливості та ринок", profile: "возможности в Украине, рынок, программы, осторожный разбор.", language: "UA" },
  { name: "Деньги и возможности", profile: "подработка, заработок, возможности, риск.", language: "RU" },
  { name: "AI и технологии", profile: "нейросети, автоматизация, технологии для работы.", language: "RU" },
  { name: "Личный прогресс", profile: "дисциплина, привычки, личная система.", language: "RU" },
  { name: "Авто и комфорт", profile: "авто, уход, комфорт за рулём.", language: "RU" },
  { name: "Дніпро / Город Днепр", profile: "городская жизнь Днепра, районы, локальные наблюдения.", language: "MIX" },
  { name: "Рыбалка и отдых", profile: "рыбалка, снасти, подготовка, отдых.", language: "RU" },
];

const realEstateChannels = [
  { name: "Инвестиции в недвижимость", profile: "доходность, окупаемость, риски, сценарии.", language: "RU" },
  { name: "Земля и дома / Земля та будинки", profile: "земля, дома, участки, документы, коммуникации.", language: "MIX" },
  { name: "Коммерческая недвижимость", profile: "аренда помещений, ставка, локация, риски.", language: "RU" },
  { name: "Нерухомість Дніпра", profile: "недвижимость Днепра на украинском, аренда, проверка объекта.", language: "UA" },
  { name: "Недвижимость Днепра", profile: "недвижимость Днепра на русском, аренда, районы, локальные советы.", language: "RU" },
];

export default function AphroditeLegacyNetworkPage() {
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AphroditePageHeader
          title="15 каналов"
          description="Старая сеть Афродиты: 10 общих тематических каналов и 5 каналов недвижимости. Все каналы сейчас на паузе и готовятся к перезапуску."
          badgeText="15 каналов"
          icon={RadioTower}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Всего каналов" value="15" caption="Legacy network" icon={RadioTower} tone="slate" />
          <MetricCard title="Общие темы" value="10" caption="Подготовка" icon={FileText} tone="amber" />
          <MetricCard title="Недвижимость" value="5" caption="Подготовка" icon={Activity} tone="cyan" />
          <MetricCard title="Статус" value="На паузе" caption="Ожидание перезапуска" icon={LockKeyhole} tone="rose" />
          <MetricCard title="Публикация" value="Блок" caption="Заблокирована" icon={CheckCircle2} tone="rose" />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Общие темы — 10</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {generalChannels.map((c) => (
              <ChannelCard key={c.name} channel={c} category="Общая тема" />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="mt-8 text-xl font-semibold text-slate-100">Недвижимость — 5</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {realEstateChannels.map((c) => (
              <ChannelCard key={c.name} channel={c} category="Недвижимость" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ChannelCard({ channel, category }: { channel: any; category: string }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-100">{channel.name}</h3>
          <span className="rounded bg-[#070b14] px-2 py-0.5 text-xs font-semibold text-slate-400 border border-slate-800">{channel.language}</span>
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{category}</p>
        <p className="mt-4 text-sm leading-6 text-slate-300">{channel.profile}</p>
      </div>
      <div className="mt-6 border-t border-slate-800/60 pt-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Статус:</span>
          <span className="text-rose-400">На паузе</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Безопасность:</span>
          <span className="text-rose-400">Публикации отключены</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Следующий шаг:</span>
          <span className="text-amber-400">Подготовить к перезапуску</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, caption, icon: Icon, tone }: { title: string; value: string | number; caption: string; icon: any; tone: "slate" | "amber" | "cyan" | "rose" }) {
  const toneClasses = {
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
    slate: "border-slate-800 bg-[#070b14] text-slate-400",
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-400">{caption}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
