import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { PostSendVerificationPanel } from "@/components/PostSendVerificationPanel";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

export default function PostSendVerificationPage() {
  requireAdminPageAccess("/admin/post-send-verification");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>
      <PostSendVerificationPanel />
    </div>
  );
}
