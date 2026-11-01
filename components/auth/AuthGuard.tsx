"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import type { UserRole } from "@/types/user";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!session || !user)) {
      const nextParam = encodeURIComponent(pathname);
      router.replace(`/login?next=${nextParam}`);
    }
  }, [isLoading, session, user, pathname, router]);

  if (isLoading || !session || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 space-y-6 animate-pulse">
        {/* Topbar Skeleton */}
        <div className="h-16 w-full rounded-2xl bg-surface border border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-36 h-5 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Dashboard Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function RoleGuard({
  role,
  children,
  fallback,
}: {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user || user.role !== role) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <h3 className="text-base font-bold text-destructive mb-1">
          Accès Restreint — Privilèges Administrateur Requis
        </h3>
        <p className="text-xs text-muted">
          Votre compte marchand ne dispose pas des droits nécessaires pour accéder à cette section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
