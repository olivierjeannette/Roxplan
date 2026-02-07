"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// ---------- Types ----------
export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Optional label shown above the slider. */
  label?: string;
  /** Whether to display the current value next to the label. */
  showValue?: boolean;
}

// ---------- Component ----------
const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, showValue = true, value, defaultValue, ...props }, ref) => {
  // Derive the displayed value from controlled or default prop.
  const displayValue = value ?? defaultValue;

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-neutral-300">{label}</span>
          )}
          {showValue && displayValue !== undefined && (
            <span className="tabular-nums text-neutral-400">
              {Array.isArray(displayValue) ? displayValue.join(" - ") : displayValue}
            </span>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={value}
        defaultValue={defaultValue}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-800">
          <SliderPrimitive.Range className="absolute h-full bg-white" />
        </SliderPrimitive.Track>

        {(displayValue ?? [0]).map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block h-4 w-4 rounded-full border border-neutral-600 bg-neutral-100 shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 hover:bg-white disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };
