import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { RegenerationQueuePanel } from "@/components/RegenerationQueuePanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function RegenerationQueuePage() {
  requireAdminPageAccess("/admin/regeneration-queue");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <RegenerationQueuePanel />
    </div>
  );
}
