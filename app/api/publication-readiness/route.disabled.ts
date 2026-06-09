import { NextResponse } from "next/server";
import { getPublicationReadinessState } from "@/lib/publication-readiness";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getPublicationReadinessState());
}
