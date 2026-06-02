import { PublishSchedulerAdminPanel } from "@/components/PublishSchedulerAdminPanel";
import { requireAdminAccessPlaceholder } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminPublishSchedulerPage() {
  requireAdminAccessPlaceholder();
  return <PublishSchedulerAdminPanel />;
}
