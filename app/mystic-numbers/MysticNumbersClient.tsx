"use client";

import { useState } from "react";
import { ChevronLeft, LockKeyhole, AlertTriangle, Sparkles, Hash, Heart, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { calculateMockMysticNumber } from "@/lib/zodiac/zodiac-mystic-numbers-mock";
import type { MysticNumberResult, MysticNumberInput } from "@/lib/zodiac/zodiac-mystic-numbers-mock";

export function MysticNumbersClient() {
  const [numberInput, setNumberInput] = useState("");
  const [mood, setMood] = useState<MysticNumberInput["mood"] | "">("");
  const [result, setResult] = useState<MysticNumberResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numberInput) return;
    setResult(calculateMockMysticNumber({ 
      numberText: numberInput, 
      mood: mood as MysticNumberInput["mood"] || undefined 
    }));
  };

  const handleExampleClick = (example: string) => {
    setNumberInput(example);
    setResult(calculateMockMysticNumber({ numberText: example }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070b14] text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070b14]/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/miniapp" className="rounded-full p-1 transition hover:bg-slate-800">
            <ChevronLeft className="h-6 w-6 text-slate-300" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-100">Mystic Numbers</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        {/* Safety Notice */}
        <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-3 text-sm text-amber-500 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Static Mock (Package 104)</p>
            <p className="mt-1 text-xs opacity-90">No payment. No database write. No Telegram API call.</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100">Decode Repeating Numbers</h2>
              <p className="mt-2 text-sm text-slate-400">Did you spot a repeating number pattern? Check its traditional numerological association.</p>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Enter the number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:11, 222, 777"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 text-xl font-bold tracking-widest text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Your mood (Optional)
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none"
                >
                  <option value="">Select mood...</option>
                  <option value="calm">Calm & Centered</option>
                  <option value="focused">Focused on Goals</option>
                  <option value="romantic">Thinking of Someone</option>
                  <option value="uncertain">Seeking Guidance</option>
                  <option value="energy">High Energy</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-violet-600 py-3.5 font-semibold text-white shadow-md shadow-violet-900/20 transition active:scale-[0.98] active:bg-violet-700"
              >
                Reveal Meaning
              </button>
            </form>

            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" /> Common Angel Numbers
              </h3>
              <div className="flex flex-wrap gap-2">
                {["11:11", "12:12", "15:15", "22:22", "777", "888"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto inline-block rounded-xl bg-violet-900/30 border border-violet-500/30 px-6 py-3 mb-2">
                <span className="text-3xl font-bold tracking-widest text-violet-400">{result.normalizedNumber}</span>
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                {result.patternType} pattern detected
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{result.headline}</h2>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Message from the Universe</h3>
                <p className="text-slate-200 leading-relaxed">{result.meaning}</p>
              </div>
              <div className="pt-4 border-t border-slate-800/50">
                <h3 className="text-sm font-medium text-slate-400 mb-1">Action to Take</h3>
                <p className="text-amber-200 font-medium">{result.actionHint}</p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-900/30 bg-emerald-900/10 p-5 text-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Daily Affirmation</h3>
              <p className="text-lg font-medium text-emerald-100 italic">&quot;{result.affirmation}&quot;</p>
            </div>

            {/* VIP Teaser */}
            <div className="rounded-xl border border-violet-900/50 bg-violet-900/10 p-5 text-center relative overflow-hidden mt-4">
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-violet-600/20 blur-xl" />
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-fuchsia-600/20 blur-xl" />
              <LockKeyhole className="mx-auto mb-3 h-8 w-8 text-violet-400" />
              <h3 className="text-lg font-bold text-slate-100">Personalized Reading</h3>
              <p className="mt-2 text-sm text-slate-300">{result.vipPreview}</p>
              <Link 
                href="/vip-preview"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 font-semibold text-slate-300 transition active:scale-[0.98] active:bg-slate-700"
              >
                View VIP Preview <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setNumberInput("");
              }}
              className="w-full mt-2 rounded-xl border border-slate-800 bg-transparent py-3 font-semibold text-slate-400 transition hover:bg-slate-800/50 active:scale-[0.98]"
            >
              Analyze Another Number
            </button>
            
            <div className="flex justify-center pt-4 flex-col items-center gap-3">
               <Link href="/miniapp" className="text-sm font-bold text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
                 ← Back to Mini App Hub
               </Link>
               <Link href="/birth-matrix" className="text-sm font-medium text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                 Try Birth Matrix Mock <ArrowRight className="h-3 w-3" />
               </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
