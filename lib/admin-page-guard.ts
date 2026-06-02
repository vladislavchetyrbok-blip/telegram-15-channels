import { redirect } from "next/navigation";
import { requireAdminAccess } from "@/lib/admin-auth";

export function requireAdminPageAccess(nextPath: string) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
  return access;
}
