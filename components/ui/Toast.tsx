"use client";

import React from "react";
import { useToast } from "@/hooks/useToast";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        return (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-surface shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
              borderColor:
                t.type === "success"
                  ? "var(--positive-border)"
                  : t.type === "error"
                  ? "var(--negative-border)"
                  : t.type === "warning"
                  ? "var(--warning-border)"
                  : "var(--info-border)",
            }}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-positive-emerald" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-5 h-5 text-negative-red" />
              )}
              {t.type === "warning" && (
                <AlertTriangle className="w-5 h-5 text-warning-amber" />
              )}
              {t.type === "info" && (
                <Info className="w-5 h-5 text-info-blue" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-sm font-semibold text-foreground mb-0.5 leading-snug">
                  {t.title}
                </h4>
              )}
              <p className="text-xs text-muted leading-relaxed break-words">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-muted hover:text-foreground p-1 rounded-md transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
