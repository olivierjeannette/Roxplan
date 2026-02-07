"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------- Inline CVA-like helper ----------
type VariantMap = Record<string, Record<string, string>>;

interface CVAConfig {
  base: string;
  variants: VariantMap;
  defaultVariants: Record<string, string>;
}

function cva(config: CVAConfig) {
  return (props: Record<string, string | undefined> = {}) => {
    const classes: string[] = [config.base];
    for (const [key, map] of Object.entries(config.variants)) {
      const value = props[key] ?? config.defaultVariants[key];
      if (value && map[value]) {
        classes.push(map[value]);
      }
    }
    return classes.join(" ");
  };
}

// ---------- Button variants ----------
const buttonVariants = cva({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default:
        "bg-white text-neutral-950 shadow hover:bg-neutral-200",
      destructive:
        "bg-red-600 text-white shadow-sm hover:bg-red-700",
      outline:
        "border border-neutral-700 bg-transparent text-neutral-100 shadow-sm hover:bg-neutral-800 hover:text-white",
      ghost:
        "text-neutral-300 hover:bg-neutral-800 hover:text-white",
      link:
        "text-neutral-300 underline-offset-4 hover:underline hover:text-white",
    },
    size: {
      sm: "h-8 rounded-md px-3 text-xs",
      default: "h-9 px-4 py-2",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-9 w-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// ---------- Types ----------
export type ButtonVariant = "default" | "destructive" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "default" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

// ---------- Component ----------
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
