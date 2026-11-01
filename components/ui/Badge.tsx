import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "emerald"
    | "lime"
    | "warning"
    | "danger"
    | "info"
    | "dark"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-subtle text-muted border-border",
    emerald:
      "bg-positive-mint text-positive-emerald border-positive-border font-mono",
    lime: "bg-brand-lime text-brand-lime-text border-transparent font-medium",
    warning:
      "bg-warning-cream text-warning-amber border-warning-border font-mono",
    danger: "bg-negative-tint text-negative-red border-negative-border font-mono",
    info: "bg-info-tint text-info-blue border-info-border font-mono",
    dark: "bg-ink text-ink-inverted border-transparent",
    outline: "bg-transparent text-foreground border-border",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 tracking-tight",
    md: "text-xs px-2.5 py-1 tracking-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono uppercase font-semibold leading-none select-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "emerald"
              ? "bg-positive-emerald"
              : variant === "lime"
              ? "bg-black"
              : variant === "danger"
              ? "bg-negative-red"
              : variant === "warning"
              ? "bg-warning-amber"
              : "bg-current"
          )}
        />
      )}
      {children}
    </span>
  );
}
