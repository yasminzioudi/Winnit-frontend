"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Store, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

export function BrandSwitcher() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const brandName = user?.brandName || "Maison Ambre Parfums";
  const city = user?.city ? `${user.city} · Marché COD` : "Tunis / Marsa · Marché COD";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-subtle transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime select-none text-left"
        aria-expanded={open}
        aria-label="Sélectionner la boutique"
      >
        <span className="text-xs md:text-sm font-semibold tracking-tight text-foreground truncate max-w-[150px] md:max-w-[200px]">
          {brandName}
        </span>
        <Badge variant="emerald" size="sm" className="px-1.5 py-0 text-[10px]">
          TND
        </Badge>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border-subtle mb-1">
            <p className="text-[11px] font-mono uppercase text-muted tracking-wider">
              Boutique Active
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {brandName}
            </p>
            <p className="text-xs text-muted">{city}</p>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-surface-subtle text-foreground text-left"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-positive-emerald" />
                <span className="truncate">{brandName}</span>
              </div>
              <Check className="w-3.5 h-3.5 text-positive-emerald shrink-0" />
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-border-subtle px-3 py-1">
            <span className="text-[11px] font-mono text-muted">
              Devise: Dinars Tunisiens (TND)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
