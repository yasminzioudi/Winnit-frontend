"use client";

import React, { useEffect, useState, useRef } from "react";

export interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
  className?: string;
}

export function CountUp({
  value,
  duration = 800,
  decimals = 0,
  prefix = "",
  suffix = "",
  formatter,
  className = "",
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState<number>(() => value);
  const startValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const isReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // For reduced motion, just update the ref and let the component re-render naturally
    if (isReducedMotion) {
      startValueRef.current = value;
      return;
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (value - startValueRef.current) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, displayValue, isReducedMotion]);

  const finalValue = isReducedMotion ? value : displayValue;
  const formatted = formatter
    ? formatter(finalValue)
    : `${prefix}${finalValue.toFixed(decimals)}${suffix}`;

  return (
    <span className={`tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}

