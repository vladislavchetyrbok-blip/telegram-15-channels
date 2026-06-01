import { Bot, CalendarClock, Eye, Send } from "lucide-react";
import { channels } from "@/data/channels";
import type { Post } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { LanguageBadge } from "@/components/LanguageBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ChannelLogoControl } from "@/components/ChannelLogoControl";
import { getTextQualityStatus } from "@/lib/text-quality";

export function PostCard({ post }: { post: Post }) {
  const channel = channels.find((item) => item.id === post.channelId);
  const textQuality = getTextQualityStatus({ title: post.title, text: post.excerpt, status: post.status });

  return (
    <article className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
      <div className="mb-4 overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.imageUrl} alt="" className="h-36 w-full object-cover" />
        {post.imageCaption ? <p className="px-3 py-2 text-xs text-slate-500">{post.imageCaption}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={post.status} />
        {post.imageStatus ? (
          <span className="inline-flex h-6 items-center rounded border border-cyan-300/25 bg-cyan-300/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-cyan-100">
            Image: {post.imageStatus}
          </span>
        ) : null}
        {channel ? <LanguageBadge language={channel.language} /> : null}
        <span className="inline-flex h-6 items-center rounded border border-emerald-300/25 bg-emerald-300/10 px-2 text-[11px] font-semibold text-emerald-100">
          Text quality: {post.textQuality ?? "medium"}
        </span>
        <span className="inline-flex h-6 items-center rounded border border-cyan-300/25 bg-cyan-300/10 px-2 text-[11px] font-semibold text-cyan-100">
          Image quality: {post.imageQuality ?? "medium"}
        </span>
        <span
          className={
            textQuality === "TEXT OK"
              ? "inline-flex h-6 items-center rounded border border-emerald-300/25 bg-emerald-300/10 px-2 text-[11px] font-semibold text-emerald-100"
              : "inline-flex h-6 items-center rounded border border-rose-300/25 bg-rose-300/10 px-2 text-[11px] font-semibold text-rose-100"
          }
        >
          {textQuality}
        </span>
        {post.aiGenerated ? (
          <span className="inline-flex h-6 items-center gap-1 rounded border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 text-[11px] font-semibold text-fuchsia-100">
            <Bot className="h-3 w-3" />
            AI
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-white">{post.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{post.excerpt}</p>

      {channel ? (
        <div className="mt-4">
          <ChannelLogoControl channelId={channel.id} compact />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2">
          <Send className="h-4 w-4 text-cyan-300" />
          {channel?.name ?? "Unknown channel"}
        </span>
        <span className="inline-flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-blue-300" />
          {formatDateTime(post.publishAt)}
        </span>
        <span className="inline-flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-500" />
          Просмотры: не синхронизировано
        </span>
      </div>
    </article>
  );
}
