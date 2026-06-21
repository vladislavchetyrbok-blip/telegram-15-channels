import type { Metadata } from "next";
import { MysticNumbersClient } from "./MysticNumbersClient";

export const metadata: Metadata = {
  title: "Mystic Numbers",
  description: "Decode the signs of the universe with Angel Numbers.",
};

export default function MysticNumbersPage() {
  return <MysticNumbersClient />;
}
