import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { ContentQualityPanel } from "@/components/ContentQualityPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function ContentQualityPage() {
  requireAdminPageAccess("/admin/content-quality");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <ContentQualityPanel />
    </div>
  );
}
