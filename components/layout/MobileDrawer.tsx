"use client";

import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Sidebar } from "./Sidebar";

export interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="left"
      className="p-0 max-w-[310px] w-full"
    >
      <div className="h-full flex flex-col">
        <Sidebar
          collapsed={false}
          className="relative static w-full border-r-0"
          onNavigate={() => onOpenChange(false)}
        />
      </div>
    </Drawer>
  );
}
