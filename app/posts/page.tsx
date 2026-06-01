import { PostCard } from "@/components/PostCard";
import { PostQualityPanel } from "@/components/PostQualityPanel";
import { posts } from "@/data/posts";
import type { PostStatus } from "@/types";

const statuses: PostStatus[] = [
  "draft",
  "pending_review",
  "approved",
  "scheduled",
  "published",
  "failed",
  "not_ready",
  "invalid_text_encoding",
  "failed_generation",
];

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Content pipeline</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Список постов</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <span key={status} className="rounded-md border border-line bg-panel px-3 py-2 text-xs text-slate-300">
              {status}: {posts.filter((post) => post.status === status).length}
            </span>
          ))}
        </div>
      </div>

      <PostQualityPanel />

      <div className="grid gap-4 xl:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
