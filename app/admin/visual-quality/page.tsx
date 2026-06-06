import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { PremiumVisualQualityPanel } from "@/components/PremiumVisualQualityPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function VisualQualityPage() {
  requireAdminPageAccess("/admin/visual-quality");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <PremiumVisualQualityPanel />
    </div>
  );
}
