"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "left";
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 flex max-w-full",
          side === "right" ? "right-0 pl-10" : "left-0 pr-10"
        )}
      >
        <div
          className={cn(
            "w-screen max-w-md transform bg-surface border-border p-6 shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto",
            side === "right"
              ? "border-l animate-in slide-in-from-right duration-300"
              : "border-r animate-in slide-in-from-left duration-300",
            className
          )}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
              <div>
                {title && (
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-muted mt-0.5">{description}</p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 text-muted hover:bg-surface-subtle hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                aria-label="Fermer le panneau"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
