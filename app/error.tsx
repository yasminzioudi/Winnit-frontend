"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 bg-grid-dots">
      <Card className="max-w-md w-full p-8 text-center border-border shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-negative-tint border border-negative-border flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-negative-red" />
        </div>

        <Badge variant="danger" size="sm" dot className="mb-3">
          Une erreur est survenue
        </Badge>

        <h1 className="text-xl font-bold tracking-tight text-foreground mb-2">
          Interruption inattendue
        </h1>

        <p className="text-xs text-muted leading-relaxed mb-6">
          {error.message ||
            "Le système a rencontré un problème lors de l'exécution de cette requête."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </Button>

          <Link href="/dashboard/overview" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full gap-2">
              <Home className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
