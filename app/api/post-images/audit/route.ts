import { NextResponse } from "next/server";
import { auditPostImages } from "@/lib/post-image-audit";

export async function GET() {
  return NextResponse.json(auditPostImages());
}
