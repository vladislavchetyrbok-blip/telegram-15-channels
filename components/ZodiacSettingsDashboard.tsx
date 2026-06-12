"use client";

import { useState } from "react";
import { NetworkModeOverview } from "@/components/NetworkModeOverview";
import { ZodiacLaunchKitOverview } from "@/components/ZodiacLaunchKitOverview";
import { ZodiacChannelConnectionPanel } from "@/components/ZodiacChannelConnectionPanel";
import { ZodiacVisualKitOverview } from "@/components/ZodiacVisualKitOverview";
import { ZodiacPublishReadinessPanel } from "@/components/ZodiacPublishReadinessPanel";
import { ZodiacCommandReference } from "@/components/ZodiacCommandReference";
import { ZodiacManualSetupGuide } from "@/components/ZodiacManualSetupGuide";
import { ZodiacVisualAssetsDashboard } from "@/components/ZodiacVisualAssetsDashboard";

type TabId = "overview" | "launchkit" | "connections" | "visuals" | "readiness" | "tools";

export function ZodiacSettingsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "readiness", label: "Readiness" },
    { id: "connections", label: "Connections" },
    { id: "launchkit", label: "Launch Kit" },
    { id: "visuals", label: "Visual Kit" },
    { id: "tools", label: "Local Tools" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-line pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50"
                : "text-slate-400 hover:bg-panel/50 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <NetworkModeOverview />
          </div>
        )}
        
        {activeTab === "readiness" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ZodiacPublishReadinessPanel />
          </div>
        )}

        {activeTab === "connections" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ZodiacManualSetupGuide />
            <ZodiacChannelConnectionPanel />
          </div>
        )}

        {activeTab === "launchkit" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ZodiacLaunchKitOverview />
          </div>
        )}

        {activeTab === "visuals" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ZodiacVisualKitOverview />
            <div className="rounded border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-blue-300">Visual Asset Production Pack</h3>
              <p className="text-xs text-blue-300/80">
                Read <code>docs/ZODIAC_AVATAR_GENERATION_PACK.md</code> for Midjourney / DALL-E prompt templates.
                Assets must be manually placed in <code>public/assets/zodiac/</code> following the 
                naming conventions in <code>docs/ZODIAC_ASSET_NAMING.md</code>.
              </p>
              <p className="text-xs text-blue-300/80">
                Use <code>npm run zodiac:validate-assets</code> to check if all expected visual assets are present and correctly named.
              </p>
            </div>
            <ZodiacVisualAssetsDashboard />
          </div>
        )}

        {activeTab === "tools" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ZodiacCommandReference />
          </div>
        )}
      </div>
    </div>
  );
}
