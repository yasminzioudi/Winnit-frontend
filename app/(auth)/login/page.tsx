"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard/overview";

  const { user, session, isLoading, login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Dismissible demo hint
  const [showHint, setShowHint] = useState(true);

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && session && user) {
      router.replace(nextUrl);
    }
  }, [isLoading, session, user, router, nextUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      success("Connexion réussie. Bienvenue sur WINNIT OS !", "Authentification");
      router.replace(nextUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Identifiants invalides.";
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoType: "merchant" | "admin") => {
    if (demoType === "merchant") {
      setEmail("demo@winnit.tn");
      setPassword("WinnitDemo2026!");
    } else {
      setEmail("admin@winnit.tn");
      setPassword("AdminWinnit2026!");
    }
    setFormError("");
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotOpen(false);
      setForgotSent(false);
      setForgotEmail("");
      success(
        "Lien de réinitialisation simulé envoyé à " + forgotEmail,
        "Email envoyé"
      );
    }, 1500);
  };

  if (isLoading || (session && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-lime border-t-transparent animate-spin" />
          <p className="text-xs text-muted font-mono">Chargement de session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 bg-grid-dots">
      <Card className="max-w-md w-full p-6 sm:p-8 border-border shadow-xl rounded-3xl">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 mb-3 border border-border shadow-2xs">
            <Image
              src="/images/logo.svg"
              alt="WINNIT"
              width={48}
              height={48}
              priority
            />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-2xl tracking-tight text-foreground">
              WINNIT
            </span>
            <Badge variant="emerald" size="sm" dot>
              OS v2.4
            </Badge>
          </div>
          <p className="text-xs text-muted font-mono uppercase tracking-wider">
            Connexion au tableau de bord
          </p>
        </div>

        {/* Dev Quick Hint Banner */}
        {showHint && (
          <div className="relative mb-5 rounded-2xl border border-border-subtle bg-surface-subtle p-3.5 text-xs">
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="absolute top-2.5 right-2.5 p-1 text-muted hover:text-foreground rounded-full hover:bg-surface transition-colors"
              aria-label="Masquer l'astuce"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 font-bold text-foreground mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span>Comptes de test (Mode Démo) :</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed mb-2">
              Cliquez pour pré-remplir les identifiants pré-hachés par le service mock :
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("merchant")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-surface border border-border hover:border-brand-lime hover:text-foreground text-muted transition-colors cursor-pointer"
              >
                Marchand : demo@winnit.tn
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-surface border border-border hover:border-brand-lime hover:text-foreground text-muted transition-colors cursor-pointer"
              >
                Admin : admin@winnit.tn
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-negative-red/10 border border-negative-red/20 text-negative-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="nom@boutique.tn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError("");
                }}
                className="pl-9 text-xs"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-muted hover:text-foreground underline transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError("");
                }}
                className="pl-9 pr-10 text-xs"
              />
              <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 rounded transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            isLoading={isSubmitting}
            className="w-full font-bold text-black text-sm h-11 rounded-2xl shadow-sm mt-2"
          >
            Se connecter au Tableau de Bord →
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <p className="text-xs text-muted">
            Pas encore de compte e-commerçant ?{" "}
            <Link
              href="/register"
              className="font-bold text-foreground hover:underline transition-colors ml-1"
            >
              Créer un compte (Essai 7j)
            </Link>
          </p>
        </div>
      </Card>

      {/* Forgot Password Modal (Mock) */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent
          onClose={() => setForgotOpen(false)}
          className="max-w-md p-6 bg-surface border-border rounded-3xl"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Mot de passe oublié ?
            </DialogTitle>
            <p className="text-xs text-muted">
              Saisissez l&apos;adresse email associée à votre compte WINNIT OS pour recevoir un lien de réinitialisation.
            </p>
          </DialogHeader>

          {forgotSent ? (
            <div className="py-6 flex flex-col items-center text-center gap-2 text-positive-emerald">
              <CheckCircle2 className="w-10 h-10 animate-in zoom-in-50 duration-200" />
              <p className="text-sm font-bold">Lien envoyé avec succès</p>
              <p className="text-xs text-muted">
                Un email de réinitialisation simulé vous a été envoyé.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendReset} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Email du compte
                </label>
                <Input
                  type="email"
                  required
                  placeholder="demo@winnit.tn"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setForgotOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="md"
                  className="text-black font-bold"
                >
                  Envoyer le lien
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-lime border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
