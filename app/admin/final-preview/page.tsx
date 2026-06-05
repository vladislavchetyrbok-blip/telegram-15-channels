import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { FinalPreviewPanel } from "@/components/FinalPreviewPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function FinalPreviewPage() {
  requireAdminPageAccess("/admin/final-preview");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <FinalPreviewPanel />
    </div>
  );
}
