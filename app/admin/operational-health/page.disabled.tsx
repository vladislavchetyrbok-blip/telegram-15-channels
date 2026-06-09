import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { OperationalHealthPanel } from "@/components/OperationalHealthPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function OperationalHealthPage() {
  requireAdminPageAccess("/admin/operational-health");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <OperationalHealthPanel />
    </div>
  );
}
