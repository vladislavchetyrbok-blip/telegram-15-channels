import { NextResponse } from "next/server";
import { regenerateMissingPostImages } from "@/lib/post-image-audit";

export async function POST() {
  return NextResponse.json(regenerateMissingPostImages());
}
