"use client";

import { useState } from "react";
import { ChevronLeft, LockKeyhole, AlertTriangle, Sparkles, Heart, Zap, Crosshair, Coins, Wind, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getMockAffirmation } from "@/lib/zodiac/zodiac-affirmations-mock";
import type { AffirmationResult, ZodiacSign, AffirmationMood } from "@/lib/zodiac/zodiac-affirmations-mock";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
] as const;

export function AffirmationsClient() {
  const [sign, setSign] = useState<ZodiacSign | "">("");
  const [mood, setMood] = useState<AffirmationMood | "">("");
  const [result, setResult] = useState<AffirmationResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sign || !mood) return;
    setResult(getMockAffirmation(sign, mood));
  };

  const handleExampleClick = (exampleSign: ZodiacSign, exampleMood: AffirmationMood) => {
    setSign(exampleSign);
    setMood(exampleMood);
    setResult(getMockAffirmation(exampleSign, exampleMood));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070b14] text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070b14]/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/compatibility" className="rounded-full p-1 transition hover:bg-slate-800">
            <ChevronLeft className="h-6 w-6 text-slate-300" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-100">Affirmations</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        {/* Safety Notice */}
        <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-3 text-sm text-amber-500 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Static Mock (Package 105)</p>
            <p className="mt-1 text-xs opacity-90">No payment. No database write. No Telegram API call.</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100">Your Daily Power</h2>
              <p className="mt-2 text-sm text-slate-400">Align your zodiac energy with your current mood to manifest the perfect outcome today.</p>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Your Zodiac Sign
                </label>
                <select
                  required
                  value={sign}
                  onChange={(e) => setSign(e.target.value as ZodiacSign)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none capitalize"
                >
                  <option value="">Select your sign...</option>
                  {ZODIAC_SIGNS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Heart className="h-4 w-4" /> What do you need today?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "calm", label: "Calm", icon: Wind },
                    { value: "confidence", label: "Confidence", icon: Sparkles },
                    { value: "love", label: "Love", icon: Heart },
                    { value: "money", label: "Money", icon: Coins },
                    { value: "focus", label: "Focus", icon: Crosshair },
                    { value: "energy", label: "Energy", icon: Zap },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(m.value as AffirmationMood)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        mood === m.value
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-slate-700 bg-slate-800/30 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <m.icon className="h-4 w-4" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!sign || !mood}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-md shadow-emerald-900/20 transition active:scale-[0.98] active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reveal My Affirmation
              </button>
            </form>

            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Examples</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { s: "gemini", m: "focus", label: "Gemini + Focus" },
                  { s: "leo", m: "confidence", label: "Leo + Confidence" },
                  { s: "scorpio", m: "love", label: "Scorpio + Love" },
                  { s: "capricorn", m: "money", label: "Capricorn + Money" },
                  { s: "pisces", m: "calm", label: "Pisces + Calm" },
                ].map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => handleExampleClick(example.s as ZodiacSign, example.m as AffirmationMood)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-emerald-400 mb-1">
                {result.sign} • {result.mood}
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{result.headline}</h2>
            </div>

            <div className="rounded-xl border border-emerald-900/30 bg-emerald-900/10 p-6 text-center shadow-lg shadow-emerald-900/5">
              <Sparkles className="h-6 w-6 text-emerald-500 mx-auto mb-4" />
              <p className="text-xl font-medium text-emerald-100 italic leading-relaxed">&quot;{result.affirmation}&quot;</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Practical Action</h3>
                <p className="text-slate-200 leading-relaxed">{result.practicalHint}</p>
              </div>
            </div>

            {/* VIP Teaser */}
            <div className="rounded-xl border border-fuchsia-900/50 bg-fuchsia-900/10 p-5 text-center relative overflow-hidden mt-4">
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-fuchsia-600/20 blur-xl" />
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-amber-600/20 blur-xl" />
              <LockKeyhole className="mx-auto mb-3 h-8 w-8 text-fuchsia-400" />
              <h3 className="text-lg font-bold text-slate-100">Premium Alignment</h3>
              <p className="mt-2 text-sm text-slate-300">{result.vipPreview}</p>
              <button
                type="button"
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 active:scale-[0.98]"
              >
                Unlock VIP Access <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setResult(null);
              }}
              className="w-full mt-2 rounded-xl border border-slate-800 bg-transparent py-3 font-semibold text-slate-400 transition hover:bg-slate-800/50 active:scale-[0.98]"
            >
              Get Another Affirmation
            </button>
            
            <div className="flex justify-center pt-4 flex-col items-center gap-3">
               <Link href="/mystic-numbers" className="text-sm font-medium text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                 Check Mystic Numbers <ArrowRight className="h-3 w-3" />
               </Link>
               <Link href="/birth-matrix" className="text-sm font-medium text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                 View Birth Matrix <ArrowRight className="h-3 w-3" />
               </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
