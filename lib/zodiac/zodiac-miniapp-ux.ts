export type MiniAppUxLink = {
  label: string;
  href: string;
  kind: "primary" | "secondary" | "safety";
};

export const miniAppCommonSafetyLabels = [
  "No payment",
  "No database",
  "No Telegram API"
];
