import Link from "next/link";
import { zodiacPlatformNavItems } from "@/lib/zodiac-platform-management";

export function ZodiacPlatformNav({ current }: { current: string }) {
  return (
    <nav aria-label="Навигация Zodiac OS" className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {zodiacPlatformNavItems.map((item) => {
          const active = item.id === current || (current === "operations" && item.id === "soft-launch");

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
