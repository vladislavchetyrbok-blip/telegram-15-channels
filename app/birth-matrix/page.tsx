import type { Metadata } from "next";
import { BirthMatrixClient } from "./BirthMatrixClient";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Матрица судьбы",
  description: "Короткий разбор главных энергий даты рождения и зоны роста.",
};

export default function BirthMatrixPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-birth-matrix-opened");

  return <BirthMatrixClient />;
}
