import { NextResponse } from "next/server";
import { auditPostImages } from "@/lib/post-image-audit";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(auditPostImages());
}
