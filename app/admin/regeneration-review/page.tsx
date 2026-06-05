import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { ManualDraftReviewPanel } from "@/components/ManualDraftReviewPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function RegenerationReviewPage() {
  requireAdminPageAccess("/admin/regeneration-review");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <ManualDraftReviewPanel />
    </div>
  );
}
