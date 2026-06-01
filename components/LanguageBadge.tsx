import type { Language } from "@/types";
import { cn } from "@/lib/utils";

const languageStyles: Record<Language, string> = {
  RU: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  UA: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
  "RU-UA": "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
};

export function LanguageBadge({ language }: { language: Language }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded border px-2 text-[11px] font-semibold tracking-wide",
        languageStyles[language],
      )}
    >
      {language}
    </span>
  );
}
