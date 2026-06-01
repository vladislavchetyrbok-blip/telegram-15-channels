import { NextResponse } from "next/server";
import { sendAdminTestReport } from "@/lib/admin-reports";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await sendAdminTestReport();
  return NextResponse.json(result, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
