import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { MirrorSyncStatusPanel } from "@/components/MirrorSyncStatusPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function MirrorSyncPage() {
  requireAdminPageAccess("/admin/mirror-sync");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <MirrorSyncStatusPanel />
    </div>
  );
}
