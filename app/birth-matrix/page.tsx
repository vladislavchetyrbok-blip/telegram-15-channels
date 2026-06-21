import type { Metadata } from "next";
import { BirthMatrixClient } from "./BirthMatrixClient";

export const metadata: Metadata = {
  title: "Birth Matrix",
  description: "Calculate your numerological destiny and energy matrix.",
};

export default function BirthMatrixPage() {
  return <BirthMatrixClient />;
}
