import { PublishSchedulerAdminPanel } from "@/components/PublishSchedulerAdminPanel";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function AdminPublishSchedulerPage() {
  requireAdminPageAccess("/admin/publish-scheduler");
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <PublishSchedulerAdminPanel />
    </div>
  );
}
