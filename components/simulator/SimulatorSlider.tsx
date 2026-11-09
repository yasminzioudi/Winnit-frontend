"use client";

import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface SimulatorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  className?: string;
}

export function SimulatorSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  isCurrency = false,
  isPercent = false,
  className,
}: SimulatorSliderProps) {
  const id = useId();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // For currency: value is in millimes, display is TND (value / 1000)
  const displayValue = isCurrency ? value / 1000 : value;
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );

  const formatDisplay = (val: number) => {
    if (isCurrency) {
      return (val / 1000).toFixed(2);
    }
    if (isPercent) {
      return `${val.toFixed(0)}%`;
    }
    return val.toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (isNaN(parsed)) return;

    if (isCurrency) {
      onChange(Math.round(parsed * 1000));
    } else {
      onChange(parsed);
    }
  };

  return (
    <div className={cn("w-full space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-xs md:text-sm font-medium text-foreground tracking-tight select-none truncate"
        >
          {label}
        </label>

        {/* Synced Number Input */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center">
            <input
              type="number"
              value={isCurrency ? (displayValue).toFixed(2) : displayValue}
              onChange={handleInputChange}
              step={isCurrency ? "0.5" : isPercent ? "1" : step.toString()}
              min={isCurrency ? min / 1000 : min}
              max={isCurrency ? max / 1000 : max}
              className="w-20 sm:w-24 px-2 py-1 text-xs sm:text-sm font-mono text-right bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-lime"
              aria-label={`${label} valeur`}
            />
          </div>
          {unit && (
            <span className="text-xs font-mono text-muted select-none min-w-[28px]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Slider Track and Thumb with 44px touch target */}
      <div
        className="relative flex items-center h-11 select-none touch-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Invisible native input for accessibility */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
          aria-label={label}
        />

        {/* Visible track background */}
        <div className="w-full h-2.5 bg-surface-subtle dark:bg-neutral-800 border border-border rounded-full relative overflow-hidden pointer-events-none">
          {/* Lime filled portion */}
          <div
            className="h-full bg-brand-lime transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Floating Value Bubble */}
        <div
          className={cn(
            "absolute -top-4 pointer-events-none transition-all duration-150 transform -translate-x-1/2 z-20",
            isHovered || isFocused ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{ left: `${percentage}%` }}
        >
          <div className="px-2 py-0.5 rounded-md bg-ink text-ink-inverted font-mono text-[11px] font-semibold shadow-md whitespace-nowrap">
            {formatDisplay(value)} {unit}
          </div>
        </div>

        {/* 44px Thumb Touch Target with Lime inner handle */}
        <div
          className="absolute top-0 w-11 h-11 flex items-center justify-center -translate-x-1/2 pointer-events-none transition-all duration-75 z-10"
          style={{ left: `${percentage}%` }}
        >
          <div className="w-5 h-5 rounded-full bg-brand-lime border-2 border-surface dark:border-neutral-900 shadow-md ring-2 ring-brand-lime/20" />
        </div>
      </div>
    </div>
  );
}

