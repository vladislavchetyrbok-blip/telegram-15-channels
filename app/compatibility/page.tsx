import type { Metadata } from "next";
import { ZodiacCompatibilityMiniApp } from "@/components/ZodiacCompatibilityMiniApp";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Гороскопы и совместимость",
  description: "Зодиакальный Mini App с прогнозами, совместимостью и удачными днями.",
};

interface CompatibilityPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function CompatibilityPage({ searchParams = {} }: CompatibilityPageProps) {
  recordAphroditeMiniAppNoopIntegrationPoint("route-compatibility-opened");

  return (
    <ZodiacCompatibilityMiniApp
      variant="public"
      initialSign={firstParam(searchParams.sign)}
      initialMode={firstParam(searchParams.mode)}
      source={firstParam(searchParams.source)}
      startParam={firstParam(searchParams.startapp) || firstParam(searchParams.tgWebAppStartParam) || firstParam(searchParams.start)}
    />
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
