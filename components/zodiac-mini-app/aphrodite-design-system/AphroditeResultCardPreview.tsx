import { AphroditeShareCard } from "./AphroditeShareCard";

export type AphroditeResultCardPreviewProps = {
  scoreLabel?: string;
  title?: string;
  insight?: string;
};

export function AphroditeResultCardPreview({
  scoreLabel = "84%",
  title = "Compatibility score visual language",
  insight = "A calm romantic result card: readable, premium, mystical, and ready for a screenshot without casino-like pressure.",
}: AphroditeResultCardPreviewProps) {
  return (
    <AphroditeShareCard
      variant="compatibility"
      scope="design-system-preview"
      eyebrow="shareable result card"
      title={title}
      subtitle="Design-system preview for Package 243 result/share cards."
      scoreLabel={scoreLabel}
      scoreDetail="score"
      insight={insight}
      highlights={[
        { label: "tone", value: "romantic" },
        { label: "layout", value: "mobile" },
        { label: "action", value: "visual only" },
      ]}
      footer="Share result preview is visual-only: no real share/send API and no canvas export."
    />
  );
}
