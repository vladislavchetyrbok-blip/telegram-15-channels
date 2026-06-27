import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeButton } from "./AphroditeButton";
import { AphroditeHeroCard } from "./AphroditeHeroCard";
import { AphroditeLockedPreviewCard } from "./AphroditeLockedPreviewCard";
import { AphroditeMetricCard } from "./AphroditeMetricCard";
import { AphroditeMysticCardPreview } from "./AphroditeMysticCardPreview";
import { AphroditeResultCardPreview } from "./AphroditeResultCardPreview";
import { AphroditeSectionHeader } from "./AphroditeSectionHeader";
import { AphroditeSurface } from "./AphroditeSurface";
import type { AphroditeDesignSystemModel, AphroditeDesignToken } from "@/lib/zodiac/aphrodite-design-system";

export type AphroditeDesignSystemShowcaseProps = {
  model: AphroditeDesignSystemModel;
};

export function AphroditeDesignSystemShowcase({ model }: AphroditeDesignSystemShowcaseProps) {
  return (
    <AphroditeSurface>
      <div className="space-y-5">
        <AphroditeSectionHeader
          eyebrow="Package 237 design system foundation"
          title="Premium mystical romantic modern Mini App preview"
          description="Static showcase only: no Mini App screen redesign, no active CTA logic change, no payment, no VIP unlock, no Telegram API."
        />

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <AphroditeHeroCard
            title="Aphrodite, but polished for Telegram"
            description="Dark cosmic depth, glass-like cards, violet, rose, and gold accents, plus a clear CTA hierarchy for future redesign packages."
            primaryLabel="Primary CTA preview"
            secondary="publicLaunchApproved=false / ownerManualReviewRequired=true"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <AphroditeMetricCard label="360px" value="OK" detail="Mobile-first width target." tone="violet" />
            <AphroditeMetricCard label="390px" value="OK" detail="Default WebView rhythm." tone="rose" />
            <AphroditeMetricCard label="430px" value="OK" detail="Wider mobile spacing." tone="gold" />
            <AphroditeMetricCard label="Safe area" value="Manual" detail="Telegram iOS/Android check." tone="cosmic" />
          </div>
        </div>

        <section className="space-y-3">
          <AphroditeSectionHeader
            title="Color and gradient tokens"
            description="Dark cosmic base with rose, violet, and gold accents. The examples stay static and local to this readiness page."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {model.colorTokens.slice(0, 10).map((token) => (
              <TokenPreview key={token.name} token={token} />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {model.gradientTokens.map((token) => (
              <GradientPreview key={token.name} token={token} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <AphroditeSectionHeader
            title="Buttons, badges, and result primitives"
            description="The controls below are presentational previews. They do not call Telegram, write data, change CTAs, or unlock VIP."
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <AphroditeButton>Primary rose-gold</AphroditeButton>
            <AphroditeButton variant="secondary">Secondary glass</AphroditeButton>
            <AphroditeButton variant="share">Share result preview</AphroditeButton>
            <AphroditeButton variant="locked">Locked VIP preview</AphroditeButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <AphroditeBadge tone="violet">violet aura</AphroditeBadge>
            <AphroditeBadge tone="rose">rose aura</AphroditeBadge>
            <AphroditeBadge tone="gold">gold aura</AphroditeBadge>
            <AphroditeBadge tone="locked">owner review required</AphroditeBadge>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <AphroditeResultCardPreview />
          <AphroditeLockedPreviewCard />
          <AphroditeMysticCardPreview />
        </section>

        <section className="rounded-lg border border-white/10 bg-black/20 p-4">
          <AphroditeSectionHeader
            title="Roadmap for Packages 238-245"
            description="Package 237 documents how future redesign packages should use these primitives; it does not start them."
          />
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {model.nextPackageUsage.map((item) => (
              <div key={item.packageNumber} className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <div className="text-sm font-semibold leading-6 text-[#fff7ed]">
                  Package {item.packageNumber} - {item.title}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-300">{item.usage}</p>
                <p className="mt-2 text-xs leading-5 text-amber-100">{item.boundary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AphroditeSurface>
  );
}

function TokenPreview({ token }: { token: AphroditeDesignToken }) {
  return (
    <div className="min-h-[132px] rounded-lg border border-white/10 bg-white/[0.055] p-3">
      <div
        className="h-8 rounded-md border border-white/10"
        style={{ background: token.value.startsWith("#") ? token.value : "rgba(255,255,255,0.08)" }}
      />
      <div className="mt-3 break-words font-mono text-xs text-slate-200">{token.name}</div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{token.usage}</p>
    </div>
  );
}

function GradientPreview({ token }: { token: AphroditeDesignToken }) {
  return (
    <div className="min-h-[112px] rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(167,139,250,0.18),rgba(251,113,133,0.12)_52%,rgba(246,213,138,0.13))] p-3">
      <div className="break-words font-mono text-xs text-slate-100">{token.name}</div>
      <p className="mt-2 text-xs leading-5 text-slate-300">{token.usage}</p>
    </div>
  );
}
