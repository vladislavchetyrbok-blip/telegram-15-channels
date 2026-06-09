import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { BackupsStatusPanel } from "@/components/BackupsStatusPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function BackupsPage() {
  requireAdminPageAccess("/admin/backups");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <BackupsStatusPanel />
    </div>
  );
}
