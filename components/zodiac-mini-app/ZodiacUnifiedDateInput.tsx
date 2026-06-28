import type { ComponentProps } from "react";
import { ZodiacDateInput } from "./ZodiacDateInput";

export type ZodiacUnifiedDateInputProps = ComponentProps<typeof ZodiacDateInput> & {
  unifiedScope?: string;
};

export function ZodiacUnifiedDateInput({ unifiedScope, birthDateScope, ...props }: ZodiacUnifiedDateInputProps) {
  return (
    <ZodiacDateInput
      {...props}
      birthDateScope={birthDateScope ?? unifiedScope}
    />
  );
}
