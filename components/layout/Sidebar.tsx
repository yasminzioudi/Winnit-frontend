"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutGrid,
  Radar,
  Sparkles,
  Box,
  Target,
  SlidersHorizontal,
  Calculator,
  Activity,
  Store,
  Zap,
  Cable,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutGrid },
  {
    name: "Product Intelligence",
    href: "/dashboard/product-intelligence",
    icon: Radar,
    badge: "New Radar",
  },
  {
    name: "AI Creative Studio",
    href: "/dashboard/ai-creative-studio",
    icon: Sparkles,
  },
  {
    name: "3D Product Studio",
    href: "/dashboard/3d-product-studio",
    icon: Box,
    badge: "3D WebGL",
  },
  { name: "Ad Intelligence", href: "/dashboard/ad-intelligence", icon: Target },
  {
    name: "Campaigns & Testing",
    href: "/dashboard/campaigns-testing",
    icon: SlidersHorizontal,
  },
  { name: "Profit OS", href: "/dashboard/profit-os", icon: Calculator },
  {
    name: "Store & Conversion Lab",
    href: "/dashboard/store-conversion-lab",
    icon: Activity,
  },
  { name: "Store Builder", href: "/dashboard/store-builder", icon: Store },
  { name: "Automations", href: "/dashboard/automations", icon: Zap },
  { name: "Integrations", href: "/dashboard/integrations", icon: Cable },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings/profile", icon: Settings },
];

export const FUNCTIONAL_NAV_ITEMS: NavItem[] = [
  { name: "Produits", href: "/dashboard/products", icon: Package },
  {
    name: "Budget Planner",
    href: "/dashboard/budget-planner",
    icon: Calendar,
  },
  { name: "Utilisateurs (Admin)", href: "/dashboard/admin/users", icon: Users },
];

export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  className = "",
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col justify-between border-r border-border bg-surface transition-all duration-200 select-none ${
        collapsed ? "w-[76px]" : "w-[290px] xl:w-[300px]"
      } ${className}`}
    >
      {/* Top Header Logo Block */}
      <div className="shrink-0">
        <div
          className={`flex items-center h-16 border-b border-border-subtle ${
            collapsed ? "justify-center px-2" : "px-5 justify-between"
          }`}
        >
          <Link
            href="/dashboard/overview"
            onClick={onNavigate}
            className="flex items-center gap-2.5 group"
          >
            {/* SVG Logo Mark */}
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.svg"
                alt="WINNIT"
                width={32}
                height={32}
                priority
              />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-black tracking-tight text-lg text-foreground leading-none">
                    WINNIT
                  </span>
                  <Badge
                    variant="emerald"
                    size="sm"
                    dot
                    className="text-[9px] px-1.5 py-0.5 tracking-tight font-mono"
                  >
                    OS v2.4
                  </Badge>
                </div>
                <span className="text-[10px] font-mono tracking-wider text-muted uppercase mt-0.5">
                  E-COMMERCE GROWTH
                </span>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Nav Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-6">
        {/* Main Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-mono uppercase text-muted tracking-widest">
              Navigation
            </p>
          )}
          <nav className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard/overview" &&
                  pathname.startsWith(item.href));

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-ink text-ink-inverted font-semibold shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-surface-subtle"
                  } ${collapsed ? "justify-center px-0 w-10 h-10 mx-auto" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-ink-inverted" : "text-muted"
                    }`}
                  />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "lime" : "emerald"}
                          size="sm"
                          className="text-[9px] px-1.5 py-0 shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} content={item.name} position="right">
                    {linkContent}
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </div>

        {/* Core Scope Quick Links (Products, Budget, Admin) */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-mono uppercase text-muted tracking-widest">
              Modules Dédiés
            </p>
          )}
          <nav className="space-y-1">
            {FUNCTIONAL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-ink text-ink-inverted font-semibold shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-surface-subtle"
                  } ${collapsed ? "justify-center px-0 w-10 h-10 mx-auto" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-ink-inverted" : "text-muted"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} content={item.name} position="right">
                    {linkContent}
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Pinned Area */}
      <div className="shrink-0 p-3 border-t border-border-subtle space-y-2 bg-surface">
        {/* COD Health Card (Exact from Screenshot 1 & 2) */}
        {!collapsed && (
          <div className="rounded-xl border border-positive-border bg-positive-mint/60 p-3 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-foreground">
                COD Health
              </span>
              <Badge
                variant="emerald"
                size="sm"
                className="text-[10px] px-1.5 py-0 font-bold"
              >
                92% Delivered
              </Badge>
            </div>
            <p className="text-[10px] font-mono text-muted">
              Tunisia Courier Link · Active
            </p>
          </div>
        )}

        {/* Collapse Sidebar Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center gap-2 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-subtle rounded-xl transition-colors ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
