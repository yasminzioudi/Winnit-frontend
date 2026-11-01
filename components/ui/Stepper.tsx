import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepItem {
  id: number;
  title: string;
  subtitle?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator node */}
              <div className="flex flex-col items-center">
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-mono font-bold transition-all duration-200",
                    isCompleted &&
                      "border-positive-emerald bg-positive-emerald text-white",
                    isCurrent &&
                      "border-brand-lime bg-ink text-brand-lime shadow-md",
                    !isCompleted &&
                      !isCurrent &&
                      "border-border bg-surface-subtle text-muted"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      "block text-xs font-semibold tracking-tight",
                      isCurrent ? "text-foreground" : "text-muted"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.subtitle && (
                    <span className="hidden sm:block text-[10px] text-muted-light font-mono">
                      {step.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-3 transition-colors duration-200 -mt-6",
                    currentStep > step.id ? "bg-positive-emerald" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
