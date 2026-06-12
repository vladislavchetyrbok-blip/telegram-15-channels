import React from "react";
import { zodiacNetwork } from "@/data/zodiacNetwork";

// Use a static tracker mapping to keep UI read-only and simple without requiring fs reads.
const trackerTemplate = {
  totalChannels: 13,
  assets: zodiacNetwork.channels.map((ch) => ({
    id: ch.id,
    avatar: {
      status: "missing (pending generation)",
      expectedPath: `public/assets/zodiac/avatars/avatar-${ch.id}.png`,
    },
    placeholder: {
      status: "missing (pending generation)",
      expectedPath: ch.id === "zodiac-general" ? "public/assets/zodiac/placeholders/placeholder-general.jpg" : `public/assets/zodiac/placeholders/placeholder-${ch.id}.jpg`,
    }
  }))
};

export function ZodiacVisualAssetsDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded border border-blue-500/20 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-blue-300">Visual Assets Dashboard (Read-Only)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Total Channels: {trackerTemplate.totalChannels} <br/>
          Expected Avatars: {trackerTemplate.totalChannels} <br/>
          Expected Placeholders: {trackerTemplate.totalChannels} <br/>
          Daily Images: Planned for later phases (optional for MVP)
        </p>
        <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300">
            <strong>Safety Note:</strong> Images are prepared manually. This UI does not upload files, 
            generate images, or publish to Telegram. Place files manually into the folders and run 
            <code> npm run zodiac:validate-assets</code> to check readiness.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {zodiacNetwork.channels.map((channel) => {
          const track = trackerTemplate.assets.find(a => a.id === channel.id);
          return (
            <div key={channel.id} className="rounded border border-slate-700 bg-slate-800 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{channel.emoji}</span>
                <h3 className="font-semibold text-slate-200">
                  {channel.ruName || channel.id} <span className="text-slate-500 text-sm">({channel.id})</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="rounded bg-slate-900 p-3 border border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Avatar</h4>
                  <p className="text-sm font-mono text-slate-300 mt-1 truncate" title={track?.avatar.expectedPath}>
                    {track?.avatar.expectedPath}
                  </p>
                  <p className="text-xs text-amber-400 mt-1">Status: {track?.avatar.status}</p>
                </div>
                
                <div className="rounded bg-slate-900 p-3 border border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Placeholder</h4>
                  <p className="text-sm font-mono text-slate-300 mt-1 truncate" title={track?.placeholder.expectedPath}>
                    {track?.placeholder.expectedPath}
                  </p>
                  <p className="text-xs text-amber-400 mt-1">Status: {track?.placeholder.status}</p>
                </div>
              </div>

              {channel.visualPromptSeed && (
                <div className="mt-2 rounded bg-slate-900 p-3 border border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Prompt Seed</h4>
                  <p className="text-xs text-slate-300 mt-1 italic">
                    {channel.visualPromptSeed}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
