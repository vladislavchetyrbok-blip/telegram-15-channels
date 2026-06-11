"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Eye, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { networkMode, zodiacNetwork } from "@/data/zodiacNetwork";
import {
  buildZodiacDailyPreview,
  type ZodiacPreviewPost,
} from "@/lib/zodiac-content-generator";
import { cn } from "@/lib/utils";

export function ZodiacDailyPreviewPanel() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [posts, setPosts] = useState<ZodiacPreviewPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? posts[0] ?? null,
    [posts, selectedPostId],
  );

  function generatePreview() {
    const nextPosts = buildZodiacDailyPreview({ date });
    setPosts(nextPosts);
    setSelectedPostId(nextPosts[0]?.id ?? null);
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-violet-300/20 bg-violet-300/5 p-5 shadow-glow">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Zodiac preview engine</p>
            <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
              <Sparkles className="h-6 w-6 text-violet-200" />
              Daily horoscope preview
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Generates {zodiacNetwork.channelCount} preview-only posts for the planned Zodiac Network. AI and Telegram are not required.
            </p>
          </div>

          <div className="grid gap-2 text-xs sm:grid-cols-3 xl:min-w-[360px]">
            <Metric label="mode" value={networkMode.active} />
            <Metric label="posts" value={posts.length || zodiacNetwork.channelCount} />
            <Metric label="publishReady" value="false" />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-11 items-center gap-2 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-300">
            <CalendarDays className="h-4 w-4 text-violet-200" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-transparent text-slate-100 outline-none"
            />
          </label>
          <button
            type="button"
            onClick={generatePreview}
            disabled={!date}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-violet-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Wand2 className="h-4 w-4" />
            Generate Zodiac Daily Preview
          </button>
          <span className="inline-flex h-11 items-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 text-sm text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            Telegram not connected
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-3">
          {posts.length ? (
            posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPostId(post.id)}
                className={cn(
                  "w-full rounded-lg border border-line bg-panel/70 p-4 text-left transition hover:border-violet-300/40 hover:bg-slate-900/80",
                  selectedPost?.id === post.id && "border-violet-300/50 bg-violet-300/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {post.emoji} {post.channelName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {post.channelId} · {post.type} · {post.status}
                    </p>
                  </div>
                  <span className="rounded border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[11px] font-semibold text-amber-100">
                    preview
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{post.title}</p>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-line bg-panel/70 p-5 text-sm leading-6 text-slate-400">
              Choose a date and generate the preview. Nothing is written to runtime files and Telegram is not called.
            </div>
          )}
        </div>

        <article className="rounded-lg border border-line bg-panel/70 p-5">
          {selectedPost ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Preview post</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedPost.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedPost.channelName} · {selectedPost.date} · publishReady={String(selectedPost.publishReady)}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
                  <Eye className="h-4 w-4" />
                  preview only
                </span>
              </div>

              <pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
                {selectedPost.text}
              </pre>

              <div className="grid gap-3 md:grid-cols-3">
                <Info label="telegramUsername" value={selectedPost.telegramUsername ?? "not connected yet"} />
                <Info label="telegramChannelId" value={selectedPost.telegramChannelId ?? "not connected yet"} />
                <Info label="status" value={selectedPost.status} />
              </div>

              <div className="rounded-md border border-violet-300/20 bg-violet-300/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Visual prompt</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedPost.visualPrompt}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center text-center text-sm leading-6 text-slate-500">
              No preview generated yet.
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-violet-300/15 bg-slate-950/40 px-3 py-2 text-right">
      <p className="font-semibold text-white">{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}
