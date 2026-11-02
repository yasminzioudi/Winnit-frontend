"use client";

import React, { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { formatMoney } from "@/lib/format/currency";
import { calculateOrderNetContribution } from "@/lib/finance/profit";
import { DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

const PRESET_PRODUCTS = [
  { id: "prd_001", name: "Aura d'Ambre Extrait (50ml)", priceTnd: 129, cogsTnd: 28, shippingTnd: 7, cpaTnd: 21.4, courier: "yalidine" },
  { id: "prd_002", name: "Aura d'Ambre Duo Bundle", priceTnd: 229, cogsTnd: 52, shippingTnd: 7, cpaTnd: 26, courier: "yalidine" },
  { id: "prd_003", name: "Lumina Obsidian Desk Lamp", priceTnd: 249, cogsTnd: 65, shippingTnd: 12, cpaTnd: 38, courier: "aramex" },
  { id: "prd_004", name: "Saddle Leather Travel Duffle", priceTnd: 320, cogsTnd: 88, shippingTnd: 15, cpaTnd: 45, courier: "aramex" },
  { id: "prd_005", name: "Velvet Rose Night Serum", priceTnd: 149, cogsTnd: 35, shippingTnd: 8, cpaTnd: 24, courier: "yalidine" },
  { id: "prd_008", name: "Sahara Gold Cuff Bracelet", priceTnd: 179, cogsTnd: 42, shippingTnd: 6, cpaTnd: 28, courier: "yalidine" },
];

const orderSchema = z.object({
  productId: z.string().min(1, "Produit requis"),
  productNameSnapshot: z.string().min(1, "Nom du produit requis"),
  quantity: z.number().int().min(1, "Quantité minimale : 1"),
  unitPriceTnd: z.number().positive("Prix positif requis"),
  unitCogsTnd: z.number().nonnegative("COGS positif requis"),
  shippingTnd: z.number().nonnegative("Frais requis"),
  courier: z.enum(["yalidine", "aramex"]),
  customerFirstName: z.string().min(2, "Prénom requis"),
  customerCity: z.string().min(2, "Ville requise"),
  customerGovernorate: z.string().min(2, "Gouvernorat requis"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface CreateOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrderDrawer({ isOpen, onClose }: CreateOrderDrawerProps) {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      productId: PRESET_PRODUCTS[0].id,
      productNameSnapshot: PRESET_PRODUCTS[0].name,
      quantity: 1,
      unitPriceTnd: PRESET_PRODUCTS[0].priceTnd,
      unitCogsTnd: PRESET_PRODUCTS[0].cogsTnd,
      shippingTnd: PRESET_PRODUCTS[0].shippingTnd,
      courier: "yalidine",
      customerFirstName: "",
      customerCity: "Tunis",
      customerGovernorate: "Tunis",
    },
  });

  const watchedValues = watch();

  const handleProductChange = (prodId: string) => {
    const selected = PRESET_PRODUCTS.find((p) => p.id === prodId);
    if (selected) {
      setValue("productId", selected.id);
      setValue("productNameSnapshot", selected.name);
      setValue("unitPriceTnd", selected.priceTnd);
      setValue("unitCogsTnd", selected.cogsTnd);
      setValue("shippingTnd", selected.shippingTnd);
      setValue("courier", selected.courier as "yalidine" | "aramex");
    }
  };

  // Live Unit Economics Preview via lib/finance
  const qty = Number(watchedValues.quantity) || 1;
  const priceMillimes = Math.round((Number(watchedValues.unitPriceTnd) || 0) * 1000);
  const cogsMillimes = Math.round((Number(watchedValues.unitCogsTnd) || 0) * 1000);
  const shippingMillimes = Math.round((Number(watchedValues.shippingTnd) || 0) * 1000);
  const courierFeeMillimes = watchedValues.courier === "aramex" ? 2000 : 0;
  const selectedProd = PRESET_PRODUCTS.find((p) => p.id === watchedValues.productId);
  const adCpaMillimes = Math.round((selectedProd?.cpaTnd || 22) * 1000);

  const deliveredNetMillimes = calculateOrderNetContribution({
    unitPriceMillimes: priceMillimes,
    unitCogsMillimes: cogsMillimes,
    quantity: qty,
    shippingMillimes,
    returnShippingMillimes: 0,
    courierFeeMillimes,
    adCpaMillimes,
    status: "delivered",
  });

  const refusedNetMillimes = calculateOrderNetContribution({
    unitPriceMillimes: priceMillimes,
    unitCogsMillimes: cogsMillimes,
    quantity: qty,
    shippingMillimes,
    returnShippingMillimes: shippingMillimes,
    courierFeeMillimes,
    adCpaMillimes,
    status: "refused",
  });

  const createMutation = useMutation({
    mutationFn: (values: OrderFormValues) => {
      const payload = {
        productId: values.productId,
        productNameSnapshot: values.productNameSnapshot,
        quantity: values.quantity,
        unitPriceMillimes: Math.round(values.unitPriceTnd * 1000),
        unitCogsMillimes: Math.round(values.unitCogsTnd * 1000),
        shippingMillimes: Math.round(values.shippingTnd * 1000),
        returnShippingMillimes: Math.round(values.shippingTnd * 1000),
        courierFeeMillimes: values.courier === "aramex" ? 2000 : 0,
        adCpaMillimes,
        courier: values.courier,
        customer: {
          firstName: values.customerFirstName,
          city: values.customerCity,
          governorate: values.customerGovernorate,
        },
      };
      return apiPost("/orders", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Commande enregistrée avec succès !", "Nouvelle Commande");
      reset();
      onClose();
    },
    onError: (err: any) => {
      toastError(err.message || "Erreur lors de la création de la commande");
    },
  });

  const onSubmit = (values: OrderFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Créer une commande" position="right">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 sm:p-6 pb-24">
        {/* Product selector */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Sélectionner un produit du catalogue
          </label>
          <Select
            value={watchedValues.productId}
            onChange={(e) => handleProductChange(e.target.value)}
            options={PRESET_PRODUCTS.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.priceTnd} TND)`,
            }))}
          />
        </div>

        {/* Quantité & Prix */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Quantité
            </label>
            <Input
              type="number"
              min={1}
              {...register("quantity", { valueAsNumber: true })}
              error={errors.quantity?.message}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Prix unitaire (TND)
            </label>
            <Input
              type="number"
              step="0.1"
              {...register("unitPriceTnd", { valueAsNumber: true })}
              error={errors.unitPriceTnd?.message}
            />
          </div>
        </div>

        {/* COGS & Frais de port */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              COGS unitaire (TND)
            </label>
            <Input
              type="number"
              step="0.1"
              {...register("unitCogsTnd", { valueAsNumber: true })}
              error={errors.unitCogsTnd?.message}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Livraison aller (TND)
            </label>
            <Input
              type="number"
              step="0.1"
              {...register("shippingTnd", { valueAsNumber: true })}
              error={errors.shippingTnd?.message}
            />
          </div>
        </div>

        {/* Transporteur */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            Transporteur assigné
          </label>
          <Select
            {...register("courier")}
            options={[
              { value: "yalidine", label: "Yalidine (Frais COD 0 TND)" },
              { value: "aramex", label: "Aramex (Frais COD 2 TND)" },
            ]}
          />
        </div>

        {/* Client details */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
          <span className="text-xs font-semibold text-foreground block mb-2">
            Informations Destinataire
          </span>
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">
                Prénom client
              </label>
              <Input
                placeholder="ex. Yassine"
                {...register("customerFirstName")}
                error={errors.customerFirstName?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-500 block mb-1">
                  Gouvernorat
                </label>
                <Select
                  {...register("customerGovernorate")}
                  options={[
                    { value: "Tunis", label: "Tunis" },
                    { value: "Ariana", label: "Ariana" },
                    { value: "Sousse", label: "Sousse" },
                    { value: "Sfax", label: "Sfax" },
                    { value: "Bizerte", label: "Bizerte" },
                    { value: "Nabeul", label: "Nabeul" },
                    { value: "Monastir", label: "Monastir" },
                    { value: "Gabès", label: "Gabès" },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 block mb-1">
                  Ville
                </label>
                <Input
                  placeholder="ex. La Marsa"
                  {...register("customerCity")}
                  error={errors.customerCity?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LIVE UNIT ECONOMICS PREVIEW BOX */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <DollarSign className="h-4 w-4" />
            <span>Aperçu Économie Unitaire (Temps Réel)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-surface dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Si Livrée (Gain net)
              </span>
              <span className={`text-sm font-bold tabular-nums ${deliveredNetMillimes >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                {formatMoney(deliveredNetMillimes / 1000, { showSign: true })}
              </span>
            </div>

            <div className="p-2.5 bg-surface dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-500 block flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-rose-500" />
                Si Refusée (Perte)
              </span>
              <span className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {formatMoney(refusedNetMillimes / 1000, { showSign: true })}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 pt-1">
            Calculé avec CPA estimé: {formatMoney(adCpaMillimes / 1000)} • Formules domain finance WINNIT OS
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
          >
            Créer la commande
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

