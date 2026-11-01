"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  className?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  className,
}: SliderProps) {
  const id = useId();
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const displayVal = formatValue
    ? formatValue(value)
    : `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="text-xs md:text-sm font-medium text-foreground tracking-tight select-none"
          >
            {label}
          </label>
        )}
        <span className="font-mono text-xs md:text-sm font-bold text-foreground shrink-0">
          {displayVal}
        </span>
      </div>

      <div className="relative flex items-center h-6 select-none touch-none">
        {/* Native range input styled invisibly over custom track */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Track Container */}
        <div className="w-full h-2.5 bg-neutral-800 rounded-full relative overflow-hidden pointer-events-none">
          {/* Lime filled track */}
          <div
            className="h-full bg-brand-lime transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Lime circular thumb */}
        <div
          className="absolute w-5 h-5 bg-brand-lime rounded-full shadow-md border-2 border-white dark:border-neutral-900 pointer-events-none -translate-x-1/2 transition-all duration-75"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
