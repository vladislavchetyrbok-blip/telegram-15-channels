import { NextResponse } from "next/server";
import { auditPostQuality, improveWeakPostMaterials } from "@/lib/post-quality";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(auditPostQuality());
}

export async function POST() {
  return NextResponse.json(improveWeakPostMaterials());
}
