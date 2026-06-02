import { Suspense } from "react";
import { AdminLoginPanel } from "@/components/AdminLoginPanel";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading admin login...</div>}>
      <AdminLoginPanel />
    </Suspense>
  );
}
