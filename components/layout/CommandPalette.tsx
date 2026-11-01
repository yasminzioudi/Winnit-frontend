"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  Calculator,
  Calendar,
  Package,
  User,
  Users,
  Sparkles,
  Box,
  Target,
  SlidersHorizontal,
  Activity,
  Store,
  Zap,
  Cable,
  FileText,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface NavCommand {
  id: string;
  title: string;
  category: "Principal" | "Outils IA" | "Administration" | "Laboratoire";
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords?: string[];
}

const COMMANDS: NavCommand[] = [
  {
    id: "overview",
    title: "Vue d'ensemble",
    category: "Principal",
    href: "/dashboard/overview",
    icon: LayoutGrid,
    keywords: ["dashboard", "accueil", "stats", "kpi"],
  },
  {
    id: "profit-os",
    title: "Profit OS — Unit Economics",
    category: "Principal",
    href: "/dashboard/profit-os",
    icon: Calculator,
    badge: "Essentiel",
    keywords: ["p&l", "waterfall", "marge", "cpa", "cogs", "livraison"],
  },
  {
    id: "budget-planner",
    title: "Planificateur de Budget",
    category: "Principal",
    href: "/dashboard/budget-planner",
    icon: Calendar,
    keywords: ["budget", "scenarios", "investissement", "tresorerie"],
  },
  {
    id: "products",
    title: "Catalogue Produits & Coordonnées",
    category: "Principal",
    href: "/dashboard/products",
    icon: Package,
    keywords: ["produit", "stock", "prix", "cout", "sku"],
  },
  {
    id: "settings-profile",
    title: "Profil & Boutique",
    category: "Administration",
    href: "/dashboard/settings/profile",
    icon: User,
    keywords: ["compte", "mot de passe", "boutique", "notif"],
  },
  {
    id: "admin-users",
    title: "Gestion des Utilisateurs",
    category: "Administration",
    href: "/dashboard/admin/users",
    icon: Users,
    badge: "Admin",
    keywords: ["membres", "roles", "equipe", "acces"],
  },
  {
    id: "product-intelligence",
    title: "Product Intelligence",
    category: "Outils IA",
    href: "/dashboard/product-intelligence",
    icon: Target,
    badge: "New Radar",
    keywords: ["radar", "espion", "gagnant", "tendance"],
  },
  {
    id: "ai-creative-studio",
    title: "AI Creative Studio",
    category: "Outils IA",
    href: "/dashboard/ai-creative-studio",
    icon: Sparkles,
    keywords: ["video", "visuel", "crea", "ads"],
  },
  {
    id: "3d-product-studio",
    title: "3D Product Studio",
    category: "Outils IA",
    href: "/dashboard/3d-product-studio",
    icon: Box,
    badge: "3D WebGL",
    keywords: ["webgl", "rendu", "animation"],
  },
  {
    id: "ad-intelligence",
    title: "Ad Intelligence",
    category: "Outils IA",
    href: "/dashboard/ad-intelligence",
    icon: Target,
    keywords: ["tiktok", "facebook", "ads", "concurrents"],
  },
  {
    id: "campaigns-testing",
    title: "Campagnes & Testing A/B",
    category: "Laboratoire",
    href: "/dashboard/campaigns-testing",
    icon: SlidersHorizontal,
    keywords: ["test", "campagne", "split"],
  },
  {
    id: "store-conversion-lab",
    title: "Store & Conversion Lab",
    category: "Laboratoire",
    href: "/dashboard/store-conversion-lab",
    icon: Activity,
    keywords: ["cro", "conversion", "panier"],
  },
  {
    id: "store-builder",
    title: "Store Builder",
    category: "Laboratoire",
    href: "/dashboard/store-builder",
    icon: Store,
    keywords: ["page", "tunnel", "checkout"],
  },
  {
    id: "automations",
    title: "Automations COD",
    category: "Laboratoire",
    href: "/dashboard/automations",
    icon: Zap,
    keywords: ["sms", "whatsapp", "confirmation", "relance"],
  },
  {
    id: "integrations",
    title: "Intégrations & Transporteurs",
    category: "Laboratoire",
    href: "/dashboard/integrations",
    icon: Cable,
    keywords: ["aramex", "yalidine", "shopify", "woocommerce"],
  },
  {
    id: "reports",
    title: "Rapports & Exports",
    category: "Principal",
    href: "/dashboard/reports",
    icon: FileText,
    keywords: ["export", "pdf", "excel", "analyse"],
  },
];

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const handleSelect = (cmd: NavCommand) => {
    onOpenChange(false);
    setQuery("");
    setSelectedIndex(0);
    router.push(cmd.href);
  };

  const handleClose = () => {
    onOpenChange(false);
    setQuery("");
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border-subtle bg-surface-subtle/30">
          <Search className="w-5 h-5 text-muted shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher outils, modules, produits..."
            className="w-full h-13 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              Aucun résultat pour « {query} »
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                      isSelected
                        ? "bg-ink text-ink-inverted font-medium"
                        : "hover:bg-surface-subtle text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? "bg-neutral-800 text-brand-lime"
                            : "bg-surface-subtle text-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{cmd.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cmd.badge && (
                        <Badge
                          variant={isSelected ? "lime" : "emerald"}
                          size="sm"
                          className="text-[10px]"
                        >
                          {cmd.badge}
                        </Badge>
                      )}
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? "text-neutral-400" : "text-muted"
                        }`}
                      >
                        {cmd.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle bg-surface-subtle/50 text-[11px] font-mono text-muted">
          <div className="flex items-center gap-2">
            <span>↑↓ pour naviguer</span>
            <span>·</span>
            <span>↵ pour ouvrir</span>
          </div>
          <span>Échap pour fermer</span>
        </div>
      </div>
    </div>
  );
}
