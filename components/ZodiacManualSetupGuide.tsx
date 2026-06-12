"use client";

import { FileText, ShieldAlert } from "lucide-react";

export function ZodiacManualSetupGuide() {
  return (
    <div className="rounded-xl border border-blue-500/30 bg-panel/50 p-6 shadow-glow">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Manual Channel Setup</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
          <ShieldAlert className="h-4 w-4" />
          <span>Real publish disabled</span>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm text-slate-300">
        <p>
          Telegram Channels cannot be created automatically via Bot API. 
          You must create the 13 Zodiac channels manually.
        </p>

        <ol className="list-decimal list-inside space-y-2 text-slate-400">
          <li>Create the Channel manually in Telegram.</li>
          <li>Set public username and description.</li>
          <li>Add the bot as an Administrator.</li>
          <li>Record the public link and username.</li>
          <li>Send the data back via the JSON template.</li>
        </ol>

        <div className="mt-6 rounded border border-blue-500/20 bg-blue-500/5 p-4 space-y-4">
          <div>
            <p className="text-blue-300 font-semibold">Reference Documents:</p>
            <ul className="mt-1 list-disc list-inside text-blue-300/80">
              <li><code>docs/ZODIAC_MANUAL_CHANNEL_CREATION.md</code></li>
              <li><code>docs/ZODIAC_PRELAUNCH_RUNBOOK.md</code></li>
              <li><code>docs/ZODIAC_OPERATOR_CHECKLIST.md</code></li>
            </ul>
          </div>
          <p className="text-xs text-blue-300/80 pt-2 border-t border-blue-500/20">
            Please read the manual creation guide for the exact names, emojis, and fallback usernames.
            Review the Pre-Launch Runbook for the full safe launch sequence. 
            Once channels are created, return the JSON template to safely update the configuration.
            Real publish is disabled; use dry-run first.
          </p>
        </div>
      </div>
    </div>
  );
}
