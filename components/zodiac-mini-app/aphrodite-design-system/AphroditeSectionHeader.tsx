import type { ReactNode } from "react";

import { AphroditeBadge } from "./AphroditeBadge";

export type AphroditeSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AphroditeSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: AphroditeSectionHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <AphroditeBadge tone="violet">{eyebrow}</AphroditeBadge> : null}
        <div>
          <h2 className="aphrodite-wrap-anywhere break-words text-lg font-semibold leading-7 text-[#fff7ed]">{title}</h2>
          {description ? <p className="aphrodite-wrap-anywhere mt-1 text-sm leading-6 text-slate-300">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="min-w-0 shrink-0">{action}</div> : null}
    </header>
  );
}
