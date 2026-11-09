"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, AlertCircle, XCircle, HelpCircle } from "lucide-react";

export interface StatusBadgeProps {
  label: "Winner" | "À surveiller" | "À couper" | "Données insuffisantes" | string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  label,
  className = "",
  showIcon = true,
}: StatusBadgeProps) {
  const config: Record<
    string,
    { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    Winner: {
      bg: "bg-positive-mint",
      text: "text-positive-emerald",
      border: "border-positive-border",
      icon: Sparkles,
    },
    "À surveiller": {
      bg: "bg-warning-cream",
      text: "text-warning-amber",
      border: "border-warning-border",
      icon: AlertCircle,
    },
    "À couper": {
      bg: "bg-negative-tint",
      text: "text-negative-red",
      border: "border-negative-border",
      icon: XCircle,
    },
    "Données insuffisantes": {
      bg: "bg-surface-subtle",
      text: "text-muted",
      border: "border-border",
      icon: HelpCircle,
    },
  };

  const item = config[label] || config["Données insuffisantes"];
  const Icon = item.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

