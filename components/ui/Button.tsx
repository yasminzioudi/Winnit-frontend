import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "brand"
    | "outline"
    | "ghost"
    | "danger"
    | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-ink text-ink-inverted hover:bg-neutral-800 active:scale-[0.99] shadow-sm",
      brand:
        "bg-brand-lime text-brand-lime-text font-semibold hover:bg-brand-lime-hover active:scale-[0.99] shadow-sm",
      outline:
        "border border-border bg-surface text-foreground hover:bg-surface-subtle active:scale-[0.99]",
      ghost:
        "text-foreground hover:bg-surface-subtle active:scale-[0.99]",
      danger:
        "bg-negative-red text-white hover:bg-red-600 active:scale-[0.99] shadow-sm",
      subtle:
        "bg-surface-subtle text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 active:scale-[0.99]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5 min-w-[32px]",
      md: "h-10 px-4 text-sm gap-2 min-h-[40px] md:min-h-0", // touch target friendly
      lg: "h-12 px-6 text-base gap-2.5 min-h-[44px]",
      icon: "h-10 w-10 p-0 shrink-0 min-h-[40px] min-w-[40px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-1" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
