"use client";

import { useState } from "react";
import { ChevronLeft, LockKeyhole, AlertTriangle, Sparkles, User, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { calculateMockBirthMatrix } from "@/lib/zodiac/zodiac-birth-matrix-mock";
import type { BirthMatrixResult } from "@/lib/zodiac/zodiac-birth-matrix-mock";

export function BirthMatrixClient() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<BirthMatrixResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    setResult(calculateMockBirthMatrix({ birthDate, birthTime, name }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070b14] text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070b14]/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/compatibility" className="rounded-full p-1 transition hover:bg-slate-800">
            <ChevronLeft className="h-6 w-6 text-slate-300" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-100">Birth Matrix</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        {/* Safety Notice */}
        <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-3 text-sm text-amber-500 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Static Mock (Package 103)</p>
            <p className="mt-1 text-xs opacity-90">No payment. No database write. No Telegram API call.</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100">Discover Your Matrix</h2>
              <p className="mt-2 text-sm text-slate-400">Enter your details to calculate your numerological destiny.</p>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Birth Date *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Birth Time (Optional)
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" /> Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-violet-600 py-3.5 font-semibold text-white shadow-md shadow-violet-900/20 transition active:scale-[0.98] active:bg-violet-700"
              >
                Calculate Matrix
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-900/30 border border-violet-500/30">
                <span className="text-4xl font-bold text-violet-400">{result.coreNumber}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Your Core Number</h2>
              <p className="text-slate-300 font-medium">{result.characterProfile}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Energy Matrix
              </h3>
              <div className="grid gap-3">
                {result.energyMatrix.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-400">{item.label}</span>
                      <span className="text-lg font-bold text-violet-400">{item.value}</span>
                    </div>
                    <p className="text-sm text-slate-300">{item.meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="mb-2 text-sm font-medium text-slate-400">Compatibility Hint</h3>
              <p className="text-sm text-slate-200">{result.compatibilityHint}</p>
            </div>

            {/* VIP Teaser */}
            <div className="rounded-xl border border-violet-900/50 bg-violet-900/10 p-5 text-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-600/20 blur-xl" />
              <LockKeyhole className="mx-auto mb-3 h-8 w-8 text-violet-400" />
              <h3 className="text-lg font-bold text-slate-100">Deep Matrix Analysis</h3>
              <p className="mt-2 text-sm text-slate-300">{result.vipPreview}</p>
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-slate-800 py-3 font-semibold text-slate-300 transition active:scale-[0.98] active:bg-slate-700"
              >
                Unlock VIP (Mock)
              </button>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full rounded-xl border border-slate-800 bg-transparent py-3 font-semibold text-slate-400 transition hover:bg-slate-800/50 active:scale-[0.98]"
            >
              Recalculate
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
