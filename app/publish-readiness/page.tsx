import { AutopublishPanel } from "@/components/AutopublishPanel";
import { PublicationReadinessPanel } from "@/components/PublicationReadinessPanel";

export default function PublishReadinessPage() {
  return (
    <div className="space-y-6">
      <AutopublishPanel />
      <PublicationReadinessPanel />
    </div>
  );
}
