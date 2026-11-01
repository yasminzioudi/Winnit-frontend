"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileDrawer } from "./MobileDrawer";
import { CommandPalette } from "./CommandPalette";
import { useIsClient } from "@/hooks/useIsClient";

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const isClient = useIsClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("winnit_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleToggleCollapse = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    try {
      localStorage.setItem("winnit_sidebar_collapsed", String(nextState));
    } catch {
      // ignore
    }
  };

  const isCollapsed = isClient ? sidebarCollapsed : false;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col bg-grid-dots transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer Navigation */}
      <MobileDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Quick Command Palette (⌘K) */}
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isCollapsed
            ? "lg:pl-[76px]"
            : "lg:pl-[290px] xl:pl-[300px]"
        }`}
      >
        <Topbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>
    </div>
  );
}
