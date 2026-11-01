import React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
  id,
}: SwitchProps) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={cn(
        "inline-flex items-center gap-3 select-none cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2",
          checked ? "bg-brand-lime" : "bg-neutral-300 dark:bg-neutral-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {description && (
            <span className="text-xs text-muted">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
