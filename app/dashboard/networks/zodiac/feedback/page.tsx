import { ChevronLeft, MessageSquareText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FeedbackCenterWorkspace } from "@/components/zodiac-platform/FeedbackCenterWorkspace";
import { ZodiacPlatformNav } from "@/components/zodiac-platform/ZodiacPlatformNav";

export const dynamic = "force-dynamic";

export default function ZodiacFeedbackCenterPage() {
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard/networks/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Zodiac / Feedback
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <MessageSquareText className="h-3.5 w-3.5" />
              Отзывы
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Feedback Center</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Центр отзывов, багов и evidence по первым пользователям.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                localStorage only
              </span>
            </div>
          </div>
          <ZodiacPlatformNav current="feedback" />
        </header>

        <FeedbackCenterWorkspace />
      </div>
    </div>
  );
}
