import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ComingSoonPageProps {
  title: string;
  badge?: string;
  description: string;
  estimatedDelivery?: string;
}

export function ComingSoonPage({
  title,
  badge,
  description,
  estimatedDelivery = "Prochaine mise à jour v2.5",
}: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center max-w-2xl mx-auto">
      <Card className="w-full p-8 md:p-12 relative overflow-hidden border-dashed">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center mb-6 shadow-sm">
            <Clock className="w-7 h-7 text-brand-lime-text dark:text-brand-lime" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="emerald" size="sm" dot>
              Bientôt disponible
            </Badge>
            {badge && (
              <Badge variant="lime" size="sm">
                {badge}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
            {title}
          </h1>

          <p className="text-sm text-muted leading-relaxed max-w-md mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/dashboard/overview">
              <Button variant="outline" size="md" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à l&apos;aperçu</span>
              </Button>
            </Link>

            <Link href="/dashboard/profit-os">
              <Button variant="primary" size="md" className="gap-2">
                <Sparkles className="w-4 h-4 text-brand-lime" />
                <span>Accéder à Profit OS</span>
              </Button>
            </Link>
          </div>

          <p className="text-[11px] font-mono text-muted-light mt-8">
            Module en cours de développement · {estimatedDelivery}
          </p>
        </div>
      </Card>
    </div>
  );
}
