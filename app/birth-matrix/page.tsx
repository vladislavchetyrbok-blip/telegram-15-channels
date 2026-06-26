import type { Metadata } from "next";
import { BirthMatrixClient } from "./BirthMatrixClient";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Birth Matrix",
  description: "Calculate your numerological destiny and energy matrix.",
};

export default function BirthMatrixPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-birth-matrix-opened");

  return <BirthMatrixClient />;
}
