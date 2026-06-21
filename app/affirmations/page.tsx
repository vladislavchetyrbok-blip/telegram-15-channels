import type { Metadata } from "next";
import { AffirmationsClient } from "./AffirmationsClient";

export const metadata: Metadata = {
  title: "Zodiac Affirmations",
  description: "Your daily power and manifestation for your zodiac sign.",
};

export default function AffirmationsPage() {
  return <AffirmationsClient />;
}
