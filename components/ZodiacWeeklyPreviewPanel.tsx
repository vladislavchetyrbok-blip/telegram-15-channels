"use client";

import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { generateZodiacWeeklyPlan, type ZodiacWeeklyPlan } from "@/lib/zodiac-weekly-plan";
import { zodiacStylePresets, defaultZodiacStylePresetId } from "@/data/zodiacStyles";
import { cn } from "@/lib/utils";

export function ZodiacWeeklyPreviewPanel() {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [stylePresetId, setStylePresetId] = useState(defaultZodiacStylePresetId);
  const [plan, setPlan] = useState<ZodiacWeeklyPlan | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  const handleGenerate = () => {
    const newPlan = generateZodiacWeeklyPlan(startDate, stylePresetId);
    setPlan(newPlan);
    setExpandedDays({ 0: true }); // Expand first day by default
  };

  const toggleDay = (index: number) => {
    setExpandedDays(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-line bg-panel p-5 shadow-glow">
        <h3 className="text-xl font-semibold text-white">7-Day Zodiac Preview</h3>
        <p className="mt-2 text-sm text-slate-400">
          Generate a full week of content for all 13 channels locally.
        </p>
        
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-line bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Style Preset</label>
            <select
              value={stylePresetId}
              onChange={(e) => setStylePresetId(e.target.value)}
              className="rounded-md border border-line bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {zodiacStylePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.ruName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Generate 7-Day Plan
          </button>
        </div>
      </div>

      {plan && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border border-cyan-300/15 bg-cyan-950/20 px-4 py-3">
              <p className="text-2xl font-bold text-cyan-400">{plan.summary.totalPosts}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">Total Posts</p>
            </div>
            <div className="rounded-md border border-cyan-300/15 bg-cyan-950/20 px-4 py-3">
              <p className="text-2xl font-bold text-cyan-400">13</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">Channels</p>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-950/20 px-4 py-3">
              <p className="text-2xl font-bold text-emerald-400">{plan.summary.averageQualityScore}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">Avg Quality</p>
            </div>
            <div className="rounded-md border border-amber-500/20 bg-amber-950/20 px-4 py-3">
              <p className="text-2xl font-bold text-amber-400">{plan.summary.postsNeedingReview}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">Needs Review</p>
            </div>
          </div>

          <div className="space-y-4">
            {plan.days.map((day) => (
              <div key={day.date} className="rounded-lg border border-line bg-panel overflow-hidden">
                <button
                  onClick={() => toggleDay(day.dayIndex)}
                  className="flex w-full items-center justify-between bg-slate-900/50 px-5 py-4 transition hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <span className="font-semibold text-white">Day {day.dayIndex + 1}: {day.date}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">13 posts</span>
                  </div>
                  {expandedDays[day.dayIndex] ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                
                {expandedDays[day.dayIndex] && (
                  <div className="divide-y divide-line p-5">
                    {day.posts.map((post) => (
                      <div key={post.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{post.emoji}</span>
                              <h5 className="font-semibold text-slate-200">{post.channelName}</h5>
                            </div>
                            <p className="mt-1 text-sm font-medium text-slate-300">{post.title}</p>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-500">{post.text}</p>
                            {post.visualPrompt && (
                              <div className="mt-3 flex items-start gap-2 rounded-md bg-slate-900 p-2 text-xs text-slate-400">
                                <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-cyan-500" />
                                <span className="line-clamp-1">{post.visualPrompt}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <span className={cn("inline-flex items-center rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider", 
                              post.editorialStatus === 'good_preview' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                              post.editorialStatus === 'needs_review' ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                              "border-red-500/30 bg-red-500/10 text-red-400"
                            )}>
                              {post.editorialStatus?.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-medium text-slate-400">Score: {post.qualityScore}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
