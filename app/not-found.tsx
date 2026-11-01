import Link from "next/link";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 bg-grid-dots">
      <Card className="max-w-md w-full p-8 text-center border-border shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center mx-auto mb-5">
          <SearchX className="w-7 h-7 text-muted" />
        </div>

        <Badge variant="warning" size="sm" dot className="mb-3">
          Erreur 404
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Page Introuvable
        </h1>

        <p className="text-xs text-muted leading-relaxed mb-6">
          La ressource demandée n&apos;existe pas ou a été déplacée. Vérifiez l&apos;URL ou retournez au tableau de bord.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link href="/dashboard/overview" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full gap-2">
              <Home className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Accueil</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
