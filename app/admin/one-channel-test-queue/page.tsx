import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { OneChannelTestQueuePanel } from "@/components/OneChannelTestQueuePanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function OneChannelTestQueuePage() {
  requireAdminPageAccess("/admin/one-channel-test-queue");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <OneChannelTestQueuePanel />
    </div>
  );
}
