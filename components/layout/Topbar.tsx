"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  Zap,
  Bell,
  Volume2,
  VolumeX,
  Menu,
  LogOut,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { BrandSwitcher } from "./BrandSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export interface TopbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  onOpenGrowthAgent?: () => void;
}

export function Topbar({
  onOpenSearch,
  onOpenMobileMenu,
  onOpenGrowthAgent,
}: TopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [muted, setMuted] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { info } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAvatarMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setAvatarMenuOpen(false);
    logout();
    info("Vous avez été déconnecté de votre session.", "Déconnexion");
    router.push("/login");
  };

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "WO";

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    info(
      nextMuted ? "Sons d'interface désactivés" : "Sons d'interface activés",
      "Audio"
    );
  };

  const handleNotificationsClick = () => {
    setHasUnreadNotifications(false);
    info("Toutes les notifications de livraison sont à jour.", "Notifications");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-surface/80 backdrop-blur-md border-b border-border transition-colors">
      {/* Left side: Mobile menu toggle + Brand Switcher */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <BrandSwitcher />
      </div>

      {/* Center: Global Search trigger matching Screenshot 1 */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between h-9 px-3.5 rounded-full border border-border bg-surface-subtle/80 hover:bg-surface-subtle text-muted hover:text-foreground text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
          aria-label="Recherche globale"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span className="truncate">
              Search tools, products, or ask…
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted bg-surface rounded border border-border shadow-2xs">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right side action controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-subtle transition-colors"
          aria-label="Recherche"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Public Site Link */}
        <Tooltip content="Voir la boutique publique" position="bottom">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-subtle text-xs font-medium text-foreground transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span>Public Site</span>
          </Link>
        </Tooltip>

        {/* Growth Agent Lime CTA Button */}
        <Button
          variant="brand"
          size="sm"
          onClick={
            onOpenGrowthAgent ||
            (() =>
              info(
                "Growth Agent IA activé — Recommandations COD prêtes.",
                "Agent IA"
              ))
          }
          className="rounded-full px-3.5 text-xs font-bold gap-1.5 text-black shadow-sm"
          aria-label="Lancer le Growth Agent IA"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span className="hidden xs:inline">Growth Agent</span>
        </Button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationsClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-lime ring-2 ring-surface" />
            )}
          </button>
        </div>

        {/* Sound Toggle Button */}
        <Tooltip
          content={muted ? "Activer les sons" : "Désactiver les sons"}
          position="bottom"
        >
          <button
            type="button"
            onClick={toggleSound}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            aria-label={muted ? "Activer les sons" : "Désactiver les sons"}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-muted" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </Tooltip>

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Avatar & Dropdown */}
        <div className="relative ml-1" ref={avatarRef}>
          <button
            type="button"
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs ring-2 ring-border hover:ring-brand-lime transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime cursor-pointer select-none"
            aria-expanded={avatarMenuOpen}
            aria-label="Menu utilisateur"
            title={`${user?.fullName ?? "Utilisateur"} — Menu compte`}
          >
            {userInitials}
          </button>

          {avatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User summary header */}
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {user?.fullName ?? "Utilisateur"}
                </p>
                <p className="text-xs text-muted truncate mt-0.5">
                  {user?.email ?? "compte@winnit.tn"}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge
                    variant={user?.role === "admin" ? "lime" : "default"}
                    size="sm"
                  >
                    {user?.role === "admin" ? "Admin" : "Marchand"}
                  </Badge>
                  <Badge variant="emerald" size="sm" dot>
                    {user?.subscription?.plan ?? "Essai 7j"}
                  </Badge>
                </div>
              </div>

              {/* Quick links */}
              <div className="space-y-0.5">
                <Link
                  href="/dashboard/settings/profile"
                  onClick={() => setAvatarMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-muted" />
                  <span>Mon profil &amp; Compte</span>
                </Link>

                {user?.role === "admin" && (
                  <Link
                    href="/dashboard/admin/users"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-brand-lime" />
                    <span>Administration Utilisateurs</span>
                  </Link>
                )}
              </div>

              {/* Logout button */}
              <div className="mt-1 pt-1 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-negative-red hover:bg-negative-red/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
