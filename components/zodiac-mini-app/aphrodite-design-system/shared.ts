export type AphroditeTone = "cosmic" | "violet" | "rose" | "gold" | "locked";

export function aphroditeClassNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
