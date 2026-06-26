export function AphroditeMysticUniversePanel({
  publicMode,
  title = "Послание Вселенной",
  message,
  focus,
  note = "Символическая подсказка для внимания и мягкого действия, не жёсткое предсказание.",
}: {
  publicMode: boolean;
  title?: string;
  message: string;
  focus: string;
  note?: string;
}) {
  return (
    <section
      className={
        publicMode
          ? "rounded-xl border border-fuchsia-200/25 bg-fuchsia-200/10 p-4"
          : "rounded-xl border border-fuchsia-100 bg-fuchsia-50 p-4"
      }
      data-aphrodite-mystic-universe-panel="package-204"
    >
      <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-fuchsia-100" : "text-xs font-semibold uppercase tracking-wide text-fuchsia-800"}>
        {title}
      </p>
      <p className={publicMode ? "mt-2 text-base font-semibold leading-7 text-white" : "mt-2 text-base font-semibold leading-7 text-slate-950"}>
        {message}
      </p>
      <div className={publicMode ? "mt-3 rounded-lg bg-black/20 p-3" : "mt-3 rounded-lg bg-white/80 p-3"}>
        <p className={publicMode ? "text-[11px] font-semibold uppercase text-fuchsia-100/80" : "text-[11px] font-semibold uppercase text-fuchsia-800"}>
          Фокус
        </p>
        <p className={publicMode ? "mt-1 text-sm leading-6 text-slate-200" : "mt-1 text-sm leading-6 text-slate-700"}>
          {focus}
        </p>
      </div>
      <p className={publicMode ? "mt-3 text-xs leading-5 text-slate-300" : "mt-3 text-xs leading-5 text-slate-600"}>
        {note}
      </p>
    </section>
  );
}
