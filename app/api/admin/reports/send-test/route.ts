import { NextResponse } from "next/server";
import { sendAdminTestReport } from "@/lib/admin-reports";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getManualWriteBlock } from "@/lib/production-safety";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  const block = getManualWriteBlock();
  if (block.blocked) {
    return NextResponse.json(block.response, { status: block.statusCode });
  }

  const result = await sendAdminTestReport();
  return NextResponse.json(result, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
