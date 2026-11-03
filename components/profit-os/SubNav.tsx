"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, ShoppingBag, Receipt, Truck, Trophy, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubNavProps {
  className?: string;
}

const NAV_TABS = [
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
    label: "Coûts & Dépenses",
    icon: Receipt,
  },
  {
    href: "/cod",
    label: "COD & Transporteurs",
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
];

export function ProfitOSSubNav({ className = "" }: SubNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Tabs */}
      <div
        className={cn(
          "hidden md:flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 w-fit",
          className
        )}
        role="tablist"
        aria-label="Profit OS Navigation"
      >
        {NAV_TABS.map((tab) => {
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
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-150 select-none",
                isActive
                  ? "bg-surface dark:bg-neutral-900 text-foreground shadow-xs border border-neutral-200/60 dark:border-neutral-700/60"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-700/40"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-neutral-400")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Bottom Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around shadow-lg"
        role="tablist"
        aria-label="Profit OS Navigation Mobile"
      >
        {NAV_TABS.map((tab) => {
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
                "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-xl text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "text-neutral-400")} />
              <span className="truncate max-w-[80px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

