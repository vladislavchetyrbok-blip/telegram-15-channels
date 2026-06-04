import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { ProductionSafetyPanel } from "@/components/ProductionSafetyPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function ProductionSafetyPage() {
  requireAdminPageAccess("/admin/production-safety");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <ProductionSafetyPanel />
    </div>
  );
}
