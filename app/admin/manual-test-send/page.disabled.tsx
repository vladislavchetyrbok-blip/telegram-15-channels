import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { ManualTestSendPanel } from "@/components/ManualTestSendPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function ManualTestSendPage() {
  requireAdminPageAccess("/admin/manual-test-send");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <ManualTestSendPanel />
    </div>
  );
}
