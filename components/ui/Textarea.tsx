import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[90px] w-full rounded-xl border border-border bg-surface-subtle p-3.5 text-sm text-foreground transition-all duration-150 placeholder:text-muted focus-visible:outline-none focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 focus-visible:ring-2 focus-visible:ring-brand-lime/50 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-negative-red focus-visible:ring-negative-red/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-negative-red font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
