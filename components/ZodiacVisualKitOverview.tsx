import { zodiacVisualProductionKit } from "@/data/zodiacVisualProductionKit";

export function ZodiacVisualKitOverview() {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-5 shadow-glow">
        <h3 className="text-xl font-semibold text-white">Visual Production Kit</h3>
        <p className="mt-2 text-sm text-slate-400">
          Global Art Direction: Luxury mystic, dark zodiac, cinematic light, premium Telegram magazine.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {zodiacVisualProductionKit.map(channel => (
          <article key={channel.id} className="rounded-lg border border-line bg-panel/70 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{channel.emoji}</span>
              <h4 className="font-semibold text-slate-200">{channel.displayName}</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Avatar Prompt (1:1)</p>
                <p className="text-xs text-slate-300 bg-slate-950 p-2 rounded line-clamp-3">{channel.avatarPrompt}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Color Palette</p>
                <div className="flex gap-2 mt-1">
                  {channel.colorPalette.map(color => (
                    <div key={color} className="w-5 h-5 rounded-full border border-slate-700" style={{ backgroundColor: color }} title={color} />
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
