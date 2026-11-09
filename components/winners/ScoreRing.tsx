"use client";

import React from "react";

export interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreRing({ score, size = "md", className = "" }: ScoreRingProps) {
  const dimensions = {
    sm: { size: 44, stroke: 4, radius: 18, fontSize: "text-xs" },
    md: { size: 56, stroke: 5, radius: 23, fontSize: "text-sm" },
    lg: { size: 76, stroke: 6, radius: 32, fontSize: "text-xl" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const colorClass =
    score >= 70
      ? "text-positive-emerald stroke-positive-emerald"
      : score >= 40
      ? "text-warning-amber stroke-warning-amber"
      : "text-negative-red stroke-negative-red";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dimensions.size, height: dimensions.size }}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
      >
        {/* Background track */}
        <circle
          className="stroke-border"
          strokeWidth={dimensions.stroke}
          fill="transparent"
          r={dimensions.radius}
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
        />
        {/* Animated score arc */}
        <circle
          className={`${colorClass} transition-all duration-500 ease-out`}
          strokeWidth={dimensions.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={dimensions.radius}
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
        />
      </svg>
      <span
        className={`absolute font-mono font-bold tabular-nums text-foreground ${dimensions.fontSize}`}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

