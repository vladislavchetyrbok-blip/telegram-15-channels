import { MobileControlPanel } from "@/components/MobileControlPanel";
import { requireAdminAccessPlaceholder } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminMobileControlPage() {
  requireAdminAccessPlaceholder();
  return <MobileControlPanel />;
}
