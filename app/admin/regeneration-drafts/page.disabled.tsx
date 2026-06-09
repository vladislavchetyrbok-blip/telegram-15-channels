import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { RegenerationDraftsPanel } from "@/components/RegenerationDraftsPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function RegenerationDraftsPage() {
  requireAdminPageAccess("/admin/regeneration-drafts");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <RegenerationDraftsPanel />
    </div>
  );
}
