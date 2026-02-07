"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------- Types ----------
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Heading displayed at the top of the sidebar. */
  title?: string;
  /** Which edge the sidebar is anchored to. */
  side?: "left" | "right";
  /** Whether the sidebar is in its narrow / collapsed state. */
  collapsed?: boolean;
  /** Callback fired when the toggle button is clicked. */
  onToggle?: () => void;
}

// ---------- Component ----------
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      title,
      side = "left",
      collapsed = false,
      onToggle,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "flex flex-col border-neutral-800 bg-neutral-950 transition-[width] duration-300 ease-in-out overflow-hidden",
          side === "left" ? "border-r" : "border-l",
          collapsed ? "w-14" : "w-64",
          className
        )}
        {...props}
      >
        {/* Header row */}
        <div
          className={cn(
            "flex h-12 shrink-0 items-center border-b border-neutral-800 px-3",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && title && (
            <span className="truncate text-sm font-semibold text-neutral-100">
              {title}
            </span>
          )}

          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-transform duration-300",
                  side === "left"
                    ? collapsed
                      ? "rotate-0"
                      : "rotate-180"
                    : collapsed
                      ? "rotate-180"
                      : "rotate-0"
                )}
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
          {children}
        </div>
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

export { Sidebar };
