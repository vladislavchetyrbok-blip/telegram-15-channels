import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { ContentPresentationPanel } from "@/components/ContentPresentationPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function ContentPresentationPage() {
  requireAdminPageAccess("/admin/content-presentation");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <ContentPresentationPanel />
    </div>
  );
}
