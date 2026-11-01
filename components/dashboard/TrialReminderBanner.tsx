"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ActivationModal } from "@/components/auth/ActivationModal";
import { useAuth } from "@/hooks/useAuth";

export function TrialReminderBanner() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // If user has active subscription, do not render banner
  if (user?.subscription?.activatedAt) {
    return null;
  }

  return (
    <>
      <div className="rounded-2xl border border-warning-amber/40 bg-warning-cream/70 dark:bg-warning-amber/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-200">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-amber/20 text-warning-amber flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-warning-amber" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-foreground">
                Essai non activé — Accès PRO GROWTH en attente
              </span>
              <Badge variant="warning" size="sm">
                0 TND
              </Badge>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Activez votre période d&apos;essai gratuite de 7 jours sans engagement pour débloquer toutes les fonctionnalités et le Pack Fournisseurs (650 DT).
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="brand"
          size="md"
          onClick={() => setModalOpen(true)}
          className="shrink-0 text-xs font-bold text-black gap-1.5 rounded-xl shadow-xs self-start sm:self-auto"
        >
          <span>Activer mon essai (0 TND)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <ActivationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => setModalOpen(false)}
      />
    </>
  );
}
