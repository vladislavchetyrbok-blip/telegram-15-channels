import { redirect } from "next/navigation";

const APHRODITE_OPERATOR_ROOT = "/dashboard/networks/aphrodite";

export const dynamic = "force-dynamic";

export default function RootPage() {
  redirect(APHRODITE_OPERATOR_ROOT);
}
