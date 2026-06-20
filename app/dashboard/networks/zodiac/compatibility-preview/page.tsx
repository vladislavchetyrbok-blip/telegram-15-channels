import { Sparkles } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { ZodiacCompatibilityMiniApp } from "@/components/ZodiacCompatibilityMiniApp";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export default function ZodiacCompatibilityPreviewPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/compatibility-preview");
  return <ZodiacCompatibilityMiniApp variant="dashboard" />;
}
