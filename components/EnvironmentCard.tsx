import { Terminal } from "lucide-react";

const environmentItems: Array<{
  label: string;
  value: string;
  tone?: "cyan" | "rose" | "slate";
}> = [
  { label: "APP_ENV", value: "local", tone: "cyan" },
  { label: "APP_URL", value: "http://localhost:3000" },
  { label: ".env.local status", value: "not configured", tone: "rose" },
  { label: "LOCAL_AI_PROVIDER", value: "lmstudio" },
  { label: "LOCAL_AI_BASE_URL", value: "http://localhost:1234/v1" },
  { label: "LOCAL_AI_MODEL", value: "local-model" },
  { label: "TELEGRAM_BOT_MODE", value: "single_bot" },
  { label: "TELEGRAM_BOT_TOKEN", value: "not stored", tone: "rose" },
  { label: "TELEGRAM_DRY_RUN", value: "true", tone: "cyan" },
];

export function EnvironmentCard() {
  return (
    <section className="rounded-lg border border-emerald-300/20 bg-panel/82 p-6 shadow-glow">
      <div className="flex items-start gap-4">
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-emerald-200">
          <Terminal className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Environment</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Local development config</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Safe mock status for the future `.env.local`. Real tokens are not displayed in the interface.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {environmentItems.map((item) => (
          <EnvironmentMetric
            key={item.label}
            label={item.label}
            value={item.value}
            tone={item.tone ?? "slate"}
          />
        ))}
      </div>
    </section>
  );
}

function EnvironmentMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "rose" | "slate";
}) {
  const toneClass = {
    cyan: "text-cyan-100",
    rose: "text-rose-100",
    slate: "text-white",
  };

  return (
    <div className="rounded-md border border-line bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-semibold ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}
