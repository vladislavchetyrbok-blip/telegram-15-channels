import type { Metadata } from "next";

import { ZodiacCompatibilityMiniApp } from "@/components/ZodiacCompatibilityMiniApp";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "APHRODITE - Telegram Mini App",
  description:
    "APHRODITE: карта дня, совместимость, гороскопы, матрица судьбы, нумерология, Таро, руны и профиль в Telegram Mini App.",
  applicationName: "APHRODITE",
  alternates: {
    canonical: "/aphrodite",
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface AphroditePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function AphroditePage({ searchParams = {} }: AphroditePageProps) {
  recordAphroditeMiniAppNoopIntegrationPoint("route-aphrodite-opened");

  return (
    <ZodiacCompatibilityMiniApp
      variant="public"
      initialSign={firstParam(searchParams.sign)}
      initialMode={firstParam(searchParams.mode)}
      source={firstParam(searchParams.source) || "aphrodite_canonical"}
      startParam={
        firstParam(searchParams.startapp) ||
        firstParam(searchParams.tgWebAppStartParam) ||
        firstParam(searchParams.start)
      }
    />
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
