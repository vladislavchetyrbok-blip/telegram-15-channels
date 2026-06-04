import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { DualReadStatusPanel } from "@/components/DualReadStatusPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function DualReadPage() {
  requireAdminPageAccess("/admin/dual-read");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <DualReadStatusPanel />
    </div>
  );
}
