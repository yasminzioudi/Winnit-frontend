"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  MapPin,
  Truck,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  SkipForward,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stepper, type StepItem } from "@/components/ui/Stepper";
import { ActivationModal } from "@/components/auth/ActivationModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { productRepository } from "@/lib/services/product";
import { checkEmailAvailable } from "@/lib/services/auth";
import {
  passwordStrength,
  isValidTunisianPhone,
} from "@/lib/services/crypto";
import { calculateUnitEconomics } from "@/lib/finance/profit";
import {
  TUNISIAN_GOVERNORATES,
  type Sector,
  type Courier,
} from "@/types/user";

const SECTORS: Sector[] = [
  "Mode & Textile",
  "Beauté & Parfums",
  "Électronique",
  "Maison & Déco",
  "Sport & Fitness",
  "Alimentation",
  "Bijoux & Accessoires",
  "Autre",
];

const COURIER_OPTIONS: { id: Courier; label: string }[] = [
  { id: "Aramex", label: "Aramex Tunisie" },
  { id: "Yalidine", label: "Yalidine Express" },
  { id: "Autre", label: "Autre transporteur" },
];

// ──────────────────────────────────────────────
// Zod schemas per step
// ──────────────────────────────────────────────

const step1Schema = z
  .object({
    fullName: z
      .string()
      .min(2, "Le nom complet est requis (au moins 2 caractères)"),
    email: z
      .string()
      .email("Adresse email invalide")
      .refine(
        (val) => val.includes("@") && val.includes("."),
        "Format d'email incorrect"
      ),
    password: z
      .string()
      .min(8, "Le mot de passe doit comporter au moins 8 caractères")
      .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
    phone: z
      .string()
      .refine(
        (val) => isValidTunisianPhone(val),
        "Numéro tunisien invalide (+216 suivi de 8 chiffres, ex: +21698765432)"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type Step1FormData = z.infer<typeof step1Schema>;

const step2Schema = z.object({
  brandName: z.string().min(2, "Le nom de la marque est requis"),
  sector: z.enum([
    "Mode & Textile",
    "Beauté & Parfums",
    "Électronique",
    "Maison & Déco",
    "Sport & Fitness",
    "Alimentation",
    "Bijoux & Accessoires",
    "Autre",
  ] as const, {
    message: "Veuillez sélectionner un secteur d'activité",
  }),
  governorate: z.enum(TUNISIAN_GOVERNORATES, {
    message: "Veuillez sélectionner un gouvernorat",
  }),
  city: z.string().min(2, "La délégation / ville est requise"),
  couriers: z
    .array(z.enum(["Aramex", "Yalidine", "Autre"] as const))
    .min(1, "Sélectionnez au moins un transporteur"),
  estimatedMonthlyOrders: z.coerce
    .number()
    .min(1, "Veuillez saisir un volume d'au moins 1 commande"),
});

type Step2FormData = z.infer<typeof step2Schema>;

const step3Schema = z.object({
  name: z.string().min(2, "Le nom du produit est requis"),
  sku: z.string().min(2, "Le SKU est requis"),
  category: z.string().min(2, "La catégorie est requise"),
  sellingPrice: z.coerce.number().positive("Le prix de vente doit être supérieur à 0"),
  cogs: z.coerce.number().min(0, "Le coût de revient ne peut être négatif"),
  logisticsCostPerOrder: z.coerce.number().min(0, "Le coût logistique ne peut être négatif"),
  returnShippingCost: z.coerce.number().min(0, "Le coût de retour ne peut être négatif"),
  targetCPA: z.coerce.number().min(0, "Le CPA cible ne peut être négatif"),
  expectedRefusalRate: z.coerce.number().min(0).max(100, "Le taux doit être entre 0 et 100%"),
  courier: z.enum(["Aramex", "Yalidine", "Autre"] as const),
});

type Step3FormData = z.infer<typeof step3Schema>;

const STEPS: StepItem[] = [
  { id: 1, title: "Compte & Accès", subtitle: "Identité & sécurité" },
  { id: 2, title: "Marque & Logistique", subtitle: "Profil e-commerce" },
  { id: 3, title: "Premier Produit", subtitle: "Coordonnées financières" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, session, isLoading, register: authRegister } = useAuth();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Stored state for Step 1 & Step 2 so going back/forward preserves input
  const [step1State, setStep1State] = useState<Step1FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "+216",
  });

  const [step2State, setStep2State] = useState<Step2FormData>({
    brandName: "",
    sector: "Beauté & Parfums",
    governorate: "Tunis",
    city: "",
    couriers: ["Aramex", "Yalidine"],
    estimatedMonthlyOrders: 100,
  });

  const [step3State, setStep3State] = useState<Step3FormData>({
    name: "Extrait de Parfum Ambre (50ml)",
    sku: "AMB-EXT-50",
    category: "Parfumerie",
    sellingPrice: 129,
    cogs: 28,
    logisticsCostPerOrder: 14,
    returnShippingCost: 8,
    targetCPA: 22,
    expectedRefusalRate: 21,
    courier: "Aramex",
  });

  // Step 1 Form
  const formStep1 = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema) as never,
    defaultValues: step1State,
    mode: "onTouched",
  });

  // Step 2 Form
  const formStep2 = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema) as never,
    defaultValues: step2State,
    mode: "onTouched",
  });

  // Step 3 Form
  const formStep3 = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema) as never,
    defaultValues: step3State,
    mode: "onChange",
  });

  // Live Unit Economics Calculation for Step 3
  const watchedSellingPrice = useWatch({
    control: formStep3.control,
    name: "sellingPrice",
  });
  const watchedCogs = useWatch({
    control: formStep3.control,
    name: "cogs",
  });
  const watchedLogistics = useWatch({
    control: formStep3.control,
    name: "logisticsCostPerOrder",
  });
  const watchedCpa = useWatch({
    control: formStep3.control,
    name: "targetCPA",
  });
  const watchedRefusalRate = useWatch({
    control: formStep3.control,
    name: "expectedRefusalRate",
  });

  const unitEconomics = calculateUnitEconomics({
    price: Number(watchedSellingPrice) || 0,
    cogs: Number(watchedCogs) || 0,
    logistics: Number(watchedLogistics) || 0,
    cpa: Number(watchedCpa) || 0,
    refusalRate: (Number(watchedRefusalRate) || 0) / 100,
  });

  // Redirect if logged in
  useEffect(() => {
    if (!isLoading && session && user && !showActivationModal) {
      router.replace("/dashboard/overview");
    }
  }, [isLoading, session, user, router, showActivationModal]);

  // Focus step heading on step change
  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStep]);

  // Password strength score
  const watchedPassword =
    useWatch({ control: formStep1.control, name: "password" }) || "";
  const pwdStrength = passwordStrength(watchedPassword);

  // ──────────────────────────────────────────────
  // Step 1 submission
  // ──────────────────────────────────────────────
  const onStep1Submit = async (data: Step1FormData) => {
    // Check email uniqueness
    const available = await checkEmailAvailable(data.email);
    if (!available) {
      formStep1.setError("email", {
        type: "manual",
        message: "Cette adresse email est déjà associée à un compte existant.",
      });
      return;
    }
    setStep1State(data);
    setCurrentStep(2);
  };

  // ──────────────────────────────────────────────
  // Step 2 submission
  // ──────────────────────────────────────────────
  const onStep2Submit = (data: Step2FormData) => {
    setStep2State(data);
    setCurrentStep(3);
  };

  // ──────────────────────────────────────────────
  // Finish Registration (with or without Step 3)
  // ──────────────────────────────────────────────
  const completeRegistration = async (productData?: Step3FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create user and login
      const { user: newUser } = await authRegister(
        {
          fullName: step1State.fullName,
          email: step1State.email,
          password: step1State.password,
          phone: step1State.phone,
        },
        step2State
      );

      // 2. If product provided, save it
      if (productData) {
        await productRepository.create({
          userId: newUser.id,
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          sellingPrice: Number(productData.sellingPrice),
          cogs: Number(productData.cogs),
          logisticsCostPerOrder: Number(productData.logisticsCostPerOrder),
          returnShippingCost: Number(productData.returnShippingCost),
          targetCPA: Number(productData.targetCPA),
          expectedRefusalRate: Number(productData.expectedRefusalRate) / 100,
          monthlyVolumeTarget: Number(step2State.estimatedMonthlyOrders) || 50,
          courier: productData.courier,
          status: "active",
        });
      }

      success(
        "Votre compte WINNIT OS a été créé avec succès !",
        "Bienvenue"
      );

      // 3. Open Activation Modal (matching Screenshot 3)
      setShowActivationModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création du compte.";
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStep3Submit = async (data: Step3FormData) => {
    setStep3State(data);
    await completeRegistration(data);
  };

  const handleSkipStep3 = async () => {
    await completeRegistration();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 bg-grid-dots">
      <Card className="max-w-2xl w-full p-6 sm:p-8 border-border shadow-2xl rounded-3xl">
        {/* Header Branding */}
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
              ESSAI GRATUIT 7 JOURS
            </Badge>
          </div>
          <p className="text-xs text-muted font-mono uppercase tracking-wider">
            Inscription &amp; Onboarding Marchand COD
          </p>
        </div>

        {/* Stepper Header */}
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          className="mb-6 max-w-lg mx-auto"
        />

        {/* Step 1: Compte & Accès */}
        {currentStep === 1 && (
          <form
            onSubmit={formStep1.handleSubmit(onStep1Submit)}
            className="space-y-4 animate-in fade-in duration-200"
          >
            <div className="border-b border-border-subtle pb-3 mb-4">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-base font-bold text-foreground focus:outline-none"
              >
                Étape 1 : Identifiants &amp; Coordonnées
              </h2>
              <p className="text-xs text-muted">
                Créez vos accès sécurisés au dashboard WINNIT OS.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <Input
                  {...formStep1.register("fullName")}
                  placeholder="ex: Slim Mansour"
                  className="pl-9 text-xs"
                />
                <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formStep1.formState.errors.fullName && (
                <p className="text-xs text-negative-red mt-1">
                  {formStep1.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Adresse email professionnelle
              </label>
              <div className="relative">
                <Input
                  type="email"
                  {...formStep1.register("email")}
                  placeholder="contact@maboutique.tn"
                  className="pl-9 text-xs"
                />
                <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formStep1.formState.errors.email && (
                <p className="text-xs text-negative-red mt-1">
                  {formStep1.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Numéro de téléphone tunisien (+216)
              </label>
              <div className="relative">
                <Input
                  {...formStep1.register("phone")}
                  placeholder="+216 98 765 432"
                  className="pl-9 text-xs font-mono"
                />
                <Phone className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted mt-1">
                Format requis : +216 suivi de 8 chiffres.
              </p>
              {formStep1.formState.errors.phone && (
                <p className="text-xs text-negative-red mt-1">
                  {formStep1.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...formStep1.register("password")}
                    placeholder="Min. 8 caractères"
                    className="pl-9 pr-10 text-xs"
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 rounded"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formStep1.formState.errors.password && (
                  <p className="text-xs text-negative-red mt-1">
                    {formStep1.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...formStep1.register("confirmPassword")}
                    placeholder="Répétez le mot de passe"
                    className="pl-9 pr-10 text-xs"
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 rounded"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formStep1.formState.errors.confirmPassword && (
                  <p className="text-xs text-negative-red mt-1">
                    {formStep1.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password strength meter */}
            {watchedPassword.length > 0 && (
              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted">Force du mot de passe :</span>
                  <span
                    className="font-bold font-mono text-[11px]"
                    style={{ color: pwdStrength.color }}
                  >
                    {pwdStrength.label}
                  </span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className="h-full flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          pwdStrength.score >= step
                            ? pwdStrength.color
                            : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full font-bold text-black text-sm h-11 rounded-2xl shadow-sm mt-4 gap-2"
            >
              <span>Continuer vers l&apos;Étape 2 (Marque &amp; Logistique)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Step 2: Marque & Logistique */}
        {currentStep === 2 && (
          <form
            onSubmit={formStep2.handleSubmit(onStep2Submit)}
            className="space-y-4 animate-in fade-in duration-200"
          >
            <div className="border-b border-border-subtle pb-3 mb-4">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-base font-bold text-foreground focus:outline-none"
              >
                Étape 2 : Profil Marchand &amp; Transporteurs
              </h2>
              <p className="text-xs text-muted">
                Configurez l&apos;environnement e-commerce tunisien de votre boutique.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nom de la marque / boutique
              </label>
              <div className="relative">
                <Input
                  {...formStep2.register("brandName")}
                  placeholder="ex: Maison Ambre Parfums"
                  className="pl-9 text-xs"
                />
                <Building className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formStep2.formState.errors.brandName && (
                <p className="text-xs text-negative-red mt-1">
                  {formStep2.formState.errors.brandName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Secteur d&apos;activité
                </label>
                <Controller
                  name="sector"
                  control={formStep2.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={SECTORS.map((s) => ({ value: s, label: s }))}
                      className="text-xs"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Devise de référence
                </label>
                <div className="flex items-center justify-between h-10 px-3.5 rounded-xl border border-border bg-surface-subtle text-muted text-xs font-mono">
                  <span>TND — Dinar Tunisien</span>
                  <Badge variant="emerald" size="sm">
                    Par défaut
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Gouvernorat (Tunisie)
                </label>
                <Controller
                  name="governorate"
                  control={formStep2.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={TUNISIAN_GOVERNORATES.map((g) => ({
                        value: g,
                        label: g,
                      }))}
                      className="text-xs"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Délégation / Ville
                </label>
                <div className="relative">
                  <Input
                    {...formStep2.register("city")}
                    placeholder="ex: La Marsa, Sousse Ville, Sfax Centre"
                    className="pl-9 text-xs"
                  />
                  <MapPin className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formStep2.formState.errors.city && (
                  <p className="text-xs text-negative-red mt-1">
                    {formStep2.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Transporteurs utilisés pour les livraisons COD
              </label>
              <Controller
                name="couriers"
                control={formStep2.control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {COURIER_OPTIONS.map((c) => {
                      const isChecked = field.value?.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            const cur = field.value || [];
                            const next = isChecked
                              ? cur.filter((x) => x !== c.id)
                              : [...cur, c.id];
                            field.onChange(next);
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                            isChecked
                              ? "border-brand-lime bg-brand-lime/10 text-foreground font-semibold"
                              : "border-border bg-surface hover:bg-surface-subtle text-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5" />
                            <span>{c.label}</span>
                          </div>
                          {isChecked && (
                            <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {formStep2.formState.errors.couriers && (
                <p className="text-xs text-negative-red mt-1">
                  {formStep2.formState.errors.couriers.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Volume de commandes mensuel estimé
              </label>
              <div className="relative">
                <Input
                  type="number"
                  {...formStep2.register("estimatedMonthlyOrders")}
                  placeholder="ex: 150"
                  className="pl-9 text-xs font-mono"
                />
                <TrendingUp className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="flex-1 font-bold text-black text-sm h-11 rounded-2xl shadow-sm gap-2"
              >
                <span>Continuer vers le Produit (Étape 3)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Premier Produit (Coordonnées Financières) */}
        {currentStep === 3 && (
          <form
            onSubmit={formStep3.handleSubmit(onStep3Submit)}
            className="space-y-4 animate-in fade-in duration-200"
          >
            <div className="border-b border-border-subtle pb-3 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-base font-bold text-foreground focus:outline-none"
                >
                  Étape 3 : Coordonnées Financières de votre 1er Produit
                </h2>
                <p className="text-xs text-muted">
                  Simulez et enregistrez votre modèle économique unitaire en dinars (TND).
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSkipStep3}
                isLoading={isSubmitting}
                className="text-xs text-muted hover:text-foreground self-start sm:self-auto gap-1"
              >
                <span>Passer cette étape</span>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Live Profit Simulator Tile (from lib/finance) */}
            <div className="rounded-2xl border border-brand-lime/40 bg-brand-lime/10 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold">
                  Rentabilité Unitaire Prévue (COD)
                </span>
                <Badge
                  variant={
                    unitEconomics.netProfitPerUnit >= 0 ? "emerald" : "danger"
                  }
                  size="sm"
                >
                  {unitEconomics.netProfitPerUnit >= 0 ? "Rentable" : "Déficitaire"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-surface border border-border">
                  <p className="text-[10px] text-muted font-mono uppercase">
                    Bénéfice Net / Unité
                  </p>
                  <p
                    className={`text-lg font-black font-mono mt-0.5 ${
                      unitEconomics.netProfitPerUnit >= 0
                        ? "text-positive-emerald"
                        : "text-negative-red"
                    }`}
                  >
                    {unitEconomics.netProfitPerUnit >= 0 ? "+" : ""}
                    {unitEconomics.netProfitPerUnit.toFixed(1)} DT
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-surface border border-border">
                  <p className="text-[10px] text-muted font-mono uppercase">
                    CPA Tolérable Max
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {unitEconomics.maxTolerableCPA.toFixed(1)} DT
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-surface border border-border">
                  <p className="text-[10px] text-muted font-mono uppercase">
                    ROAS Seuil (Seuil)
                  </p>
                  <p className="text-lg font-bold font-mono text-brand-lime mt-0.5">
                    {unitEconomics.breakEvenROAS}x
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nom du produit
                </label>
                <Input
                  {...formStep3.register("name")}
                  placeholder="ex: Extrait de Parfum Ambre"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  SKU / Référence
                </label>
                <Input
                  {...formStep3.register("sku")}
                  placeholder="ex: AMB-001"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Prix de vente (DT)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  {...formStep3.register("sellingPrice")}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  COGS / Achat (DT)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  {...formStep3.register("cogs")}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Logistique (DT)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  {...formStep3.register("logisticsCostPerOrder")}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  CPA Cible (DT)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  {...formStep3.register("targetCPA")}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Taux refus COD (%)
                </label>
                <Input
                  type="number"
                  {...formStep3.register("expectedRefusalRate")}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Frais retour (DT)
                </label>
                <Input
                  type="number"
                  {...formStep3.register("returnShippingCost")}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Transporteur par défaut
                </label>
                <Controller
                  name="courier"
                  control={formStep3.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "Aramex", label: "Aramex" },
                        { value: "Yalidine", label: "Yalidine" },
                        { value: "Autre", label: "Autre" },
                      ]}
                      className="text-xs"
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="lg"
                isLoading={isSubmitting}
                className="flex-1 font-bold text-black text-sm h-11 rounded-2xl shadow-sm gap-2"
              >
                <span>Enregistrer le produit &amp; Finaliser</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-border-subtle text-center">
          <p className="text-xs text-muted">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-bold text-foreground hover:underline transition-colors ml-1"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </Card>

      {/* Activation Modal (Screenshot 3) */}
      <ActivationModal
        open={showActivationModal}
        onOpenChange={(open) => {
          setShowActivationModal(open);
          if (!open) {
            // User closed the modal without activating -> redirect to overview
            router.push("/dashboard/overview");
          }
        }}
        onSuccess={() => {
          router.push("/dashboard/overview");
        }}
      />
    </div>
  );
}
