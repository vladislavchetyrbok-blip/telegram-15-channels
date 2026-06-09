import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { DraftApplyPanel } from "@/components/DraftApplyPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function DraftApplyPage() {
  requireAdminPageAccess("/admin/draft-apply");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <DraftApplyPanel />
    </div>
  );
}
