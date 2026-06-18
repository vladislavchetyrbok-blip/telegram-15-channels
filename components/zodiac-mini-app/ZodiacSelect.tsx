"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface ZodiacSelectOption<Value extends string = string> {
  value: Value;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export function ZodiacSelect<Value extends string = string>({
  publicMode,
  label,
  value,
  options,
  onChange,
  placeholder = "Выберите...",
  disabled = false,
  className = "",
}: {
  publicMode: boolean;
  label?: string;
  value: Value | "";
  options: Array<ZodiacSelectOption<Value>>;
  onChange: (value: Value) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`} data-zodiac-select data-zodiac-select-value={value || ""}>
      {label ? <p className={publicMode ? "mb-1 text-xs font-semibold text-slate-300" : "mb-1 text-xs font-semibold text-slate-600"}>{label}</p> : null}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className={
          publicMode
            ? "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-left text-sm text-white outline-none transition hover:border-amber-200/45 focus:border-amber-200 focus:ring-2 focus:ring-amber-200/25 disabled:opacity-55"
            : "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-950 outline-none transition hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 disabled:opacity-55"
        }
      >
        <span className="min-w-0">
          <span className={selected ? "block truncate font-semibold" : publicMode ? "block truncate text-slate-400" : "block truncate text-slate-500"}>
            {selected?.label ?? placeholder}
          </span>
          {selected?.description ? (
            <span className={publicMode ? "mt-0.5 block truncate text-xs text-slate-400" : "mt-0.5 block truncate text-xs text-slate-500"}>{selected.description}</span>
          ) : null}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""} ${publicMode ? "text-amber-100" : "text-slate-500"}`} />
      </button>
      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className={
            publicMode
              ? "absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-white/12 bg-[#151126] p-1 shadow-2xl shadow-black/40"
              : "absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
          }
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                data-zodiac-select-option-value={option.value}
                aria-selected={active}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setOpen(false);
                }}
                className={
                  publicMode
                    ? `flex min-h-11 w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                        active ? "bg-amber-200/14 text-amber-50" : "text-slate-200 hover:bg-white/8"
                      } disabled:opacity-50`
                    : `flex min-h-11 w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                        active ? "bg-amber-50 text-amber-900" : "text-slate-700 hover:bg-slate-50"
                      } disabled:opacity-50`
                }
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{option.label}</span>
                  {option.description ? <span className={publicMode ? "mt-0.5 block text-xs leading-4 text-slate-400" : "mt-0.5 block text-xs leading-4 text-slate-500"}>{option.description}</span> : null}
                </span>
                {active ? <Check className={publicMode ? "mt-0.5 h-4 w-4 shrink-0 text-amber-100" : "mt-0.5 h-4 w-4 shrink-0 text-amber-700"} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
