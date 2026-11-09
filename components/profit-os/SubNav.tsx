"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  ShoppingBag,
  Receipt,
  Truck,
  Trophy,
  FlaskConical,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubNavProps {
  className?: string;
}

export const PROFIT_OS_TABS = [
  {
    href: "/dashboard/profit-os",
    label: "Tableau de bord",
    icon: Calculator,
  },
  {
    href: "/orders",
    label: "Commandes",
    icon: ShoppingBag,
  },
  {
    href: "/costs",
    label: "Coûts",
    icon: Receipt,
  },
  {
    href: "/cod",
    label: "COD",
    icon: Truck,
  },
  {
    href: "/winners",
    label: "Podium",
    icon: Trophy,
  },
  {
    href: "/simulator",
    label: "Simulateur",
    icon: FlaskConical,
  },
  {
    href: "/reports",
    label: "Rapports",
    icon: FileText,
  },
];

export function ProfitOSSubNav({ className = "" }: SubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "grid grid-cols-4 md:grid-cols-7 gap-1 p-1 bg-surface-subtle dark:bg-neutral-800/80 rounded-xl md:rounded-2xl border border-border w-full select-none",
        className
      )}
      role="tablist"
      aria-label="Navigation Profit OS"
    >
      {PROFIT_OS_TABS.map((tab, idx) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/dashboard/profit-os" && pathname.startsWith(tab.href));
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 md:px-2.5 py-2 text-[11px] md:text-xs lg:text-sm font-medium rounded-lg md:rounded-xl transition-all duration-150 min-h-[44px]",
              idx === 6 ? "col-span-2 md:col-span-1" : "col-span-1",
              isActive
                ? "bg-surface dark:bg-neutral-900 text-foreground font-semibold shadow-xs border border-border"
                : "text-muted hover:text-foreground hover:bg-surface-subtle/80"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-primary" : "text-muted"
              )}
            />
            <span className="truncate max-w-full text-center leading-tight">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
