"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Smartphone,
  Building2,
  Check,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { isValidPromoCode } from "@/lib/services/crypto";
import type { MockSubscription } from "@/types/user";

export interface ActivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ActivationModal({
  open,
  onOpenChange,
  onSuccess,
}: ActivationModalProps) {
  const { activateSubscription } = useAuth();
  const { success, error: toastError } = useToast();

  const [paymentMethod, setPaymentMethod] =
    useState<MockSubscription["paymentMethod"]>("card");
  const [promoCode, setPromoCode] = useState("LAUNCH2026");
  const [promoApplied, setPromoApplied] = useState(true);
  const [promoError, setPromoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyPromo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!promoCode.trim()) {
      setPromoApplied(false);
      setPromoError("Veuillez saisir un code promo.");
      return;
    }
    if (isValidPromoCode(promoCode)) {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setPromoError("Code invalide. Utilisez le code LAUNCH2026 pour le lancement.");
    }
  };

  const handleActivate = async () => {
    setIsSubmitting(true);
    try {
      await activateSubscription(paymentMethod);
      success(
        "Votre accès PRO GROWTH a été activé avec succès !",
        "Abonnement Actif"
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'activation.";
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-w-2xl p-6 sm:p-8 bg-surface border-border shadow-2xl rounded-3xl"
      >
        <DialogHeader className="mb-4 text-center sm:text-left">
          {/* Header row: Logo + Mono green badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border">
                <Image
                  src="/images/logo.svg"
                  alt="WINNIT"
                  width={40}
                  height={40}
                  priority
                />
              </div>
              <span className="font-black text-lg tracking-tight text-foreground">
                WINNIT <span className="text-muted font-normal text-sm">OS</span>
              </span>
            </div>

            <Badge variant="emerald" size="md" dot className="self-start sm:self-auto font-mono text-[11px]">
              ESSAI GRATUIT 7 JOURS
            </Badge>
          </div>

          {/* Title and Subtitle */}
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-2">
            Activez votre accès à WINNIT OS — PRO GROWTH
          </DialogTitle>
          <p className="text-xs text-muted leading-relaxed mt-1">
            Démarrez votre essai de 7 jours sans engagement.{" "}
            <strong className="text-foreground font-semibold">0 TND débité aujourd&apos;hui</strong>.
            Accès immédiat au Pack Fournisseurs certifiés COD d&apos;une valeur de 650 DT offert.
          </p>
        </DialogHeader>

        {/* Plan Summary Card */}
        <div className="rounded-2xl border border-border bg-surface-subtle/70 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-foreground">
                PRO GROWTH
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-brand-lime/20 text-neutral-900 dark:text-neutral-100 font-bold border border-brand-lime/30">
                Cycle : Annuel (2 mois offerts)
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-mono text-base font-bold text-foreground">
                89 TND
              </span>
              <span className="text-xs text-muted"> / mois après l&apos;essai</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-muted">
            <span className="flex items-center gap-1 text-positive-emerald">
              <Check className="w-3.5 h-3.5" /> Pack Fournisseurs COD (650 DT) inclus
            </span>
            <span className="flex items-center gap-1 text-positive-emerald">
              <Check className="w-3.5 h-3.5" /> Recommandations IA COD
            </span>
            <span className="flex items-center gap-1 text-positive-emerald">
              <Check className="w-3.5 h-3.5" /> Exports Excel &amp; PDF illimités
            </span>
          </div>
        </div>

        {/* Selectable Payment Cards (3 Options) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Mode de paiement pour l&apos;activation (aucun débit immédiat) :
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Option 1: Carte Bancaire */}
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === "card"
                  ? "border-positive-emerald bg-positive-emerald/5 ring-1 ring-positive-emerald shadow-xs"
                  : "border-border bg-surface hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <CreditCard
                  className={`w-4 h-4 ${
                    paymentMethod === "card"
                      ? "text-positive-emerald"
                      : "text-muted"
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "card"
                      ? "border-positive-emerald bg-positive-emerald"
                      : "border-border"
                  }`}
                >
                  {paymentMethod === "card" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Carte Bancaire</p>
                <p className="text-[10px] text-muted">GIM-TEL / CIB / Visa</p>
              </div>
            </button>

            {/* Option 2: Flouci / D17 */}
            <button
              type="button"
              onClick={() => setPaymentMethod("flouci")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === "flouci"
                  ? "border-positive-emerald bg-positive-emerald/5 ring-1 ring-positive-emerald shadow-xs"
                  : "border-border bg-surface hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Smartphone
                  className={`w-4 h-4 ${
                    paymentMethod === "flouci"
                      ? "text-positive-emerald"
                      : "text-muted"
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "flouci"
                      ? "border-positive-emerald bg-positive-emerald"
                      : "border-border"
                  }`}
                >
                  {paymentMethod === "flouci" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Flouci / D17</p>
                <p className="text-[10px] text-muted">Paiement Mobile Tunisie</p>
              </div>
            </button>

            {/* Option 3: Virement Instantané */}
            <button
              type="button"
              onClick={() => setPaymentMethod("virement")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === "virement"
                  ? "border-positive-emerald bg-positive-emerald/5 ring-1 ring-positive-emerald shadow-xs"
                  : "border-border bg-surface hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Building2
                  className={`w-4 h-4 ${
                    paymentMethod === "virement"
                      ? "text-positive-emerald"
                      : "text-muted"
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "virement"
                      ? "border-positive-emerald bg-positive-emerald"
                      : "border-border"
                  }`}
                >
                  {paymentMethod === "virement" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Virement Instant</p>
                <p className="text-[10px] text-muted">RIB BCT / Validation 1h</p>
              </div>
            </button>
          </div>
        </div>

        {/* Promo code input + Apply */}
        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError("");
              }}
              placeholder="Code promo (ex: LAUNCH2026)"
              className="text-xs font-mono uppercase bg-surface-subtle"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleApplyPromo}
              className="shrink-0 bg-ink text-white dark:bg-white dark:text-ink font-semibold text-xs px-4"
            >
              Appliquer
            </Button>
          </div>

          {promoApplied && (
            <p className="text-xs font-medium text-positive-emerald flex items-center gap-1.5 mt-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>
                Code LAUNCH2026 appliqué : -20% sur l&apos;abonnement annuel après l&apos;essai + Pack Fournisseurs VIP inclus.
              </span>
            </p>
          )}

          {promoError && (
            <p className="text-xs text-negative-red mt-1.5 font-medium">
              {promoError}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Button
          type="button"
          variant="brand"
          size="lg"
          onClick={handleActivate}
          isLoading={isSubmitting}
          className="w-full h-12 rounded-2xl font-black text-black text-sm shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
        >
          Valider &amp; Activer WINNIT OS Immédiatement →
        </Button>

        {/* Footer Micro-text */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] font-mono text-muted">
          <Lock className="w-3 h-3" />
          <span>256-Bit SSL · 0 TND Débité Immédiatement · Annulation en 1 Clic</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
