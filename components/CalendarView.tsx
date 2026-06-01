import { channels } from "@/data/channels";
import { posts } from "@/data/posts";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

const days = [
  "2026-05-20",
  "2026-05-21",
  "2026-05-22",
  "2026-05-23",
  "2026-05-24",
  "2026-05-25",
  "2026-05-26",
];

export function CalendarView() {
  return (
    <div className="grid gap-4 xl:grid-cols-7">
      {days.map((day) => {
        const dayPosts = posts.filter((post) => post.publishAt.startsWith(day));
        const date = new Date(`${day}T12:00:00+03:00`);

        return (
          <section key={day} className="min-h-72 rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {date.toLocaleDateString("ru-RU", { weekday: "short" })}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                </h3>
              </div>
              <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                {dayPosts.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {dayPosts.length ? (
                dayPosts.map((post) => {
                  const channel = channels.find((item) => item.id === post.channelId);

                  return (
                    <div key={post.id} className="rounded-md border border-line bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-cyan-200">{formatDateTime(post.publishAt)}</p>
                        <StatusBadge status={post.status} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-white">{post.title}</p>
                      <p className="mt-2 line-clamp-1 text-xs text-slate-500">{channel?.name}</p>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-slate-700/70 text-sm text-slate-500">
                  Свободное окно
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
