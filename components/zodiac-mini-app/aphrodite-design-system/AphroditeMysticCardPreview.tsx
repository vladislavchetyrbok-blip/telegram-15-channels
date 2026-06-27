import { WandSparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeCard } from "./AphroditeCard";

export type AphroditeMysticCardPreviewProps = {
  title?: string;
  meaning?: string;
};

export function AphroditeMysticCardPreview({
  title = "Mystic card visual language",
  meaning = "Violet depth, soft gold detail, readable reveal text, and reflective romantic tone without fear or external assets.",
}: AphroditeMysticCardPreviewProps) {
  return (
    <AphroditeCard tone="violet" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <AphroditeBadge tone="violet">mystic cards</AphroditeBadge>
        <WandSparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-violet-100" />
      </div>
      <div className="rounded-lg border border-violet-200/20 bg-[linear-gradient(180deg,rgba(167,139,250,0.16),rgba(17,16,36,0.78))] p-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-amber-100/20 bg-black/20 text-2xl text-amber-100">
          A
        </div>
        <div className="mt-4 text-center">
          <h3 className="break-words text-base font-semibold leading-6 text-[#fff7ed]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{meaning}</p>
        </div>
      </div>
    </AphroditeCard>
  );
}
