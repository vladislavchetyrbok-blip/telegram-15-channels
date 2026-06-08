import { notFound } from "next/navigation";
import { CalendarClock, FileText, Send } from "lucide-react";
import { ChannelStatsControl } from "@/components/ChannelStatsControl";
import { LanguageBadge } from "@/components/LanguageBadge";
import { PostCard } from "@/components/PostCard";
import { StatCard } from "@/components/StatCard";
import { getChannelGenerationConfig } from "@/data/channelGeneration";
import { channels } from "@/data/channels";
import { getEditorialProfile } from "@/data/editorialProfiles";
import { posts } from "@/data/posts";
import { checkTelegramChannelConnection } from "@/lib/telegram";
import Link from "next/link";

interface ChannelPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return [
    ...channels.map((channel) => ({ id: channel.id })),
    ...channels.map((_, index) => ({ id: String(index + 1) })),
  ];
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const numericId = Number(params.id);
  const channel =
    channels.find((item) => item.id === params.id) ||
    (Number.isInteger(numericId) && numericId >= 1 ? channels[numericId - 1] : undefined);

  if (!channel) {
    notFound();
  }

  const channelPosts = posts.filter((post) => post.channelId === channel.id);
  const generationConfig = getChannelGenerationConfig(channel.id);
  const connection = generationConfig ? checkTelegramChannelConnection(generationConfig) : null;
  const profile = getEditorialProfile(channel.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel/82 p-6 shadow-glow">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <LanguageBadge language={channel.language} />
              <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                Группа {channel.group}
              </span>
              <span className="rounded border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-xs text-slate-300">
                {channel.category}
              </span>
              {connection ? (
                <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                  {connection.status}
                </span>
              ) : null}
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">{channel.name}</h2>
            <p className="mt-3 text-base leading-7 text-slate-400">{channel.description}</p>
          </div>
          <div className="rounded-lg border border-line bg-black/20 p-4 xl:w-80 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tone profile</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{channel.tone}</p>
            </div>
            
            {profile && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Рубрики (Pillars)</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{profile.contentPillars.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Стиль текста</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                    {profile.styleRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
                {channel.visualProfile && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Стиль картинки</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {channel.visualProfile.stylePreset} / {channel.visualProfile.imageTone}
                    </p>
                  </div>
                )}
              </>
            )}
            {connection ? (
              <div className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-300/5 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  <Send className="h-3.5 w-3.5" />
                  Telegram dry-run link
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-300">{connection.telegramChatId}</p>
                <p className="mt-2 text-xs text-slate-500">{connection.message}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Подписчики" value="не синхронизировано" icon={FileText} tone="slate" />
        <StatCard title="Постов сегодня" value={channel.postsToday} icon={FileText} tone="blue" />
        <StatCard title="Запланировано" value={channel.scheduledPosts} icon={CalendarClock} tone="cyan" />
        <StatCard title="ER" value="не рассчитан" icon={FileText} tone="slate" />
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <Link href={`/posts/new?channel=${channel.id}`} className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500">
          Сгенерировать пост
        </Link>
        <Link href={`/visual-preview?channel=${channel.id}`} className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
          Preview
        </Link>
        <Link href={`/single-channel-test?channel=${channel.id}`} className="inline-flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20">
          Тестовая публикация
        </Link>
      </section>

      <ChannelStatsControl channelId={channel.id} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Посты канала</h3>
          <span className="text-sm text-slate-500">{channelPosts.length} items</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {channelPosts.length ? (
            channelPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-500">
              Для этого канала пока нет dry-run постов.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
