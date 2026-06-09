import { NextResponse } from "next/server";
import { fixBrokenPostImagePaths } from "@/lib/post-image-audit";

export async function POST() {
  return NextResponse.json(fixBrokenPostImagePaths());
}
