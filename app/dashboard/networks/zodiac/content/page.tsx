import { CalendarClock, CheckCircle2, ChevronLeft, ClipboardList, FileText, Languages, MessageSquareText, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ContentTemplateStudio } from "@/components/zodiac-platform/ContentTemplateStudio";
import { ZodiacPlatformNav } from "@/components/zodiac-platform/ZodiacPlatformNav";
import {
  zodiacContentOverviewCards,
  zodiacContentRubrics,
  zodiacContentTemplateCatalog,
  type ZodiacContentRisk,
  type ZodiacContentTemplateStatus,
} from "@/lib/zodiac-platform-content";
import { zodiacPlatformChannels } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

const overviewIcons = [FileText, CalendarClock, Languages, MessageSquareText, ClipboardList, Rocket] as const;

export default function ZodiacContentEnginePage() {
  const channels = zodiacPlatformChannels.map((channel) => ({ slug: channel.slug, title: channel.title, icon: channel.icon }));

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard/networks/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Zodiac / Контент
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Контент
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Контент-движок</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Шаблоны, рубрики, CTA, превью и контроль качества постов для Telegram-сети.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                local drafts only
              </span>
            </div>
          </div>
          <ZodiacPlatformNav current="content" />
        </header>

        <section data-qa="content-engine-overview-cards" className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {zodiacContentOverviewCards.map((card, index) => (
            <OverviewCard key={card.label} label={card.label} value={card.value} tone={card.tone} icon={overviewIcons[index] ?? FileText} />
          ))}
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold leading-6">
              Шаблоны работают как локальные черновики и preview. Live-публикация недоступна из dashboard, server writes не создаются, dry-run остаётся обязательным перед любым approved process.
            </p>
          </div>
        </section>

        <section data-qa="template-catalog" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Template catalog</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Каталог owner-facing шаблонов. Статусы здесь не запускают публикации и не меняют расписание.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
              <Languages className="h-4 w-4" />
              RU/UA/EN
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zodiacContentTemplateCatalog.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>

        <ContentTemplateStudio templates={zodiacContentTemplateCatalog} channels={channels} />

        <section data-qa="rubric-planner" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Рубрики</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Планировщик рубрик только показывает cadence, канал и CTA. Он не включает weekly live и не меняет schedule.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
              <Rocket className="h-4 w-4" />
              live scheduling changes: NO
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-3 py-3">Рубрика</th>
                  <th className="px-3 py-3">Cadence</th>
                  <th className="px-3 py-3">Target channel</th>
                  <th className="px-3 py-3">CTA</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {zodiacContentRubrics.map((rubric) => (
                  <tr key={rubric.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-4 font-semibold text-slate-950">{rubric.name}</td>
                    <td className="px-3 py-4 text-slate-700">{rubric.cadence}</td>
                    <td className="px-3 py-4 text-slate-700">{rubric.targetChannel}</td>
                    <td className="px-3 py-4 font-mono text-xs font-semibold text-violet-700">startapp={rubric.cta}</td>
                    <td className="px-3 py-4"><StatusBadge status={rubric.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <LinkCard href="/dashboard/networks/zodiac/publishing" title="Публикации" text="Перенеси approved local draft в manual post flow только вручную и после dry-run." icon={ClipboardList} />
          <LinkCard href="/dashboard/networks/zodiac/security" title="Безопасность" text="Проверь Approval Matrix: live publish и weekly live остаются заблокированы." icon={ShieldCheck} />
          <LinkCard href="/dashboard/networks/zodiac/channels" title="Каналы" text="Сверь topic/startapp с текущим channel registry." icon={FileText} />
        </section>
      </div>
    </div>
  );
}

function OverviewCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: OverviewTone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`rounded-lg border p-2 ${overviewToneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: (typeof zodiacContentTemplateCatalog)[number] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">{template.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{template.topic}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[template.risk]}`}>{template.risk}</span>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <InfoRow label="Languages" value={template.languages.join("/")} />
        <InfoRow label="Channel/topic" value={template.recommendedChannel} />
        <InfoRow label="CTA" value={template.ctaTarget} />
        <InfoRow label="startapp" value={template.startapp} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={template.status} />
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{template.note}</span>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="break-words text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ZodiacContentTemplateStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>{status}</span>;
}

function LinkCard({ href, title, text, icon: Icon }: { href: string; title: string; text: string; icon: LucideIcon }) {
  return (
    <Link href={href} prefetch={false} className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-950 group-hover:text-violet-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
    </Link>
  );
}

type OverviewTone = "violet" | "cyan" | "emerald" | "amber" | "slate" | "rose";

const overviewToneClasses: Record<OverviewTone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusClasses: Record<ZodiacContentTemplateStatus, string> = {
  draft: "border-slate-200 bg-white text-slate-700",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  backlog: "border-amber-200 bg-amber-50 text-amber-700",
};

const riskClasses: Record<ZodiacContentRisk, string> = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  review: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
};
