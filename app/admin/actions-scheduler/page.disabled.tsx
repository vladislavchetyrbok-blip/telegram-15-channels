import { ActionsSchedulerMonitorPanel } from "@/components/ActionsSchedulerMonitorPanel";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function ActionsSchedulerPage() {
  requireAdminPageAccess("/admin/actions-scheduler");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <ActionsSchedulerMonitorPanel />
    </div>
  );
}
