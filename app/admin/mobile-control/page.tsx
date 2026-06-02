import { MobileControlPanel } from "@/components/MobileControlPanel";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function AdminMobileControlPage() {
  requireAdminPageAccess("/admin/mobile-control");
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <MobileControlPanel />
    </div>
  );
}
