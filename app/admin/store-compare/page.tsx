import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { StoreComparePanel } from "@/components/StoreComparePanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function StoreComparePage() {
  requireAdminPageAccess("/admin/store-compare");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <StoreComparePanel />
    </div>
  );
}
