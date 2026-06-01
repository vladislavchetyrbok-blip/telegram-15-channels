import type { PostStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<PostStatus, string> = {
  draft: "Draft",
  ready_for_review: "Ready for review",
  ready_to_publish: "Ready",
  pending_review: "Review",
  approved: "Approved",
  scheduled: "Scheduled",
  test_published: "Test published",
  published: "Published",
  sent: "Sent",
  failed: "Failed",
  not_ready: "Not ready",
  invalid_text_encoding: "Broken text",
  failed_generation: "Failed generation",
  blocked: "Blocked",
};

const statusStyles: Record<PostStatus, string> = {
  draft: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  ready_for_review: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  ready_to_publish: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  pending_review: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  scheduled: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  test_published: "border-blue-400/40 bg-blue-400/10 text-blue-200",
  published: "border-blue-400/40 bg-blue-400/10 text-blue-200",
  sent: "border-blue-400/40 bg-blue-400/10 text-blue-200",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  not_ready: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  invalid_text_encoding: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  failed_generation: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  blocked: "border-rose-400/40 bg-rose-400/10 text-rose-200",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded border px-2 text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
