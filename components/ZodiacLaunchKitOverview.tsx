import { zodiacLaunchKit } from "@/data/zodiacLaunchKit";

export function ZodiacLaunchKitOverview() {
  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-violet-300/20 bg-violet-300/5 p-5 shadow-glow">
        <h3 className="text-xl font-semibold text-white">Zodiac Channel Launch Kit</h3>
        <p className="mt-2 text-sm text-slate-400">
          Planned channels for the Zodiac Network Phase 3. Real channels are not created yet. 
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zodiacLaunchKit.map((channel) => (
          <article
            key={channel.id}
            className="rounded-lg border border-line bg-panel/70 p-5 transition hover:border-violet-300/40 hover:bg-slate-900/80"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-semibold text-slate-200">{channel.displayName}</h4>
              <span className="shrink-0 rounded border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                {channel.status}
              </span>
            </div>
            
            <div className="mt-4 space-y-3">
              <Info label="Username (Suggested)" value={`@${channel.primaryUsernameSuggestion}`} />
              <Info label="Description" value={channel.description} />
              
              <div className="rounded-md border border-slate-700/50 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Avatar Prompt</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-300">{channel.avatarPrompt}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-300">{value}</p>
    </div>
  );
}
