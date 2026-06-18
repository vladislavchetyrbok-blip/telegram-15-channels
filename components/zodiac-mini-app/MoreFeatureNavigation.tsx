import type { MenuFeatureGroup, MoreFeatureId } from "./types";

export function MoreFeatureNavigation({
  features,
  activeFeature,
  pairReady,
  natalReady,
  signReady,
  onChange,
}: {
  features: Array<{ id: MoreFeatureId; label: string; shortLabel: string; group: MenuFeatureGroup; requirement?: "pair" | "natal" | "sign" }>;
  activeFeature: MoreFeatureId;
  pairReady: boolean;
  natalReady: boolean;
  signReady: boolean;
  onChange: (feature: MoreFeatureId) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {[{ id: "menu", title: "" }].map((group) => {
        const groupedFeatures = features;
        return (
          <div key={group.id}>
            {group.title ? <p className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{group.title}</p> : null}
            <div className="-mx-1 mt-2 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {groupedFeatures.map((feature) => {
                  const active = activeFeature === feature.id;
                  const blockedHint =
                    feature.requirement === "pair" && !pairReady
                      ? "нужна пара"
                      : feature.requirement === "natal" && !natalReady
                        ? "нужна дата"
                        : feature.requirement === "sign" && !signReady
                          ? "нужен знак"
                          : null;
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => onChange(feature.id)}
                      className={
                        active
                          ? "min-h-[58px] min-w-[92px] rounded-lg border border-amber-200/60 bg-amber-200/15 px-3 py-2 text-left shadow-sm"
                          : "min-h-[58px] min-w-[92px] rounded-lg border border-white/10 bg-white/7 px-3 py-2 text-left transition hover:border-fuchsia-200/35 hover:bg-white/10"
                      }
                      aria-current={active ? "page" : undefined}
                      aria-label={feature.label}
                    >
                      <span className={active ? "block text-sm font-semibold leading-4 text-white" : "block text-sm font-semibold leading-4 text-slate-200"}>{feature.shortLabel}</span>
                      <span className={blockedHint ? "mt-1 block text-[11px] font-semibold leading-4 text-amber-100" : active ? "mt-1 block text-[11px] leading-4 text-amber-100" : "mt-1 block text-[11px] leading-4 text-slate-400"}>
                        {blockedHint ?? (active ? "открыто" : "перейти")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
