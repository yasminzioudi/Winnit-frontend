import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl border border-border bg-surface-subtle px-4 pr-10 text-sm text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 focus-visible:ring-2 focus-visible:ring-brand-lime/50 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-negative-red focus-visible:ring-negative-red/30",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-negative-red font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
