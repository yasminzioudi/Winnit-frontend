import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/placeholder/ComingSoonPage";

interface TeammateRouteInfo {
  title: string;
  badge?: string;
  description: string;
}

const TEAMMATE_ROUTES: Record<string, TeammateRouteInfo> = {
  "product-intelligence": {
    title: "Product Intelligence",
    badge: "New Radar",
    description:
      "Scannez les marchés e-commerce et détectez les produits gagnants à fort potentiel de marge en Tunisie et en Afrique du Nord.",
  },
  "ai-creative-studio": {
    title: "AI Creative Studio",
    description:
      "Générez des vidéos promotionnelles, hooks et visuels publicitaires à fort taux de conversion calibrés pour TikTok et Meta Ads.",
  },
  "3d-product-studio": {
    title: "3D Product Studio",
    badge: "3D WebGL",
    description:
      "Modélisation 3D temps réel et rendu interactif WebGL pour valoriser vos produits phares et booster votre taux de conversion.",
  },
  "ad-intelligence": {
    title: "Ad Intelligence",
    description:
      "Espionnez les créatives de vos concurrents directs et analysez les angles marketing les plus performants du marché.",
  },
  "campaigns-testing": {
    title: "Campagnes & Testing A/B",
    description:
      "Automatisez vos tests d'offres, bundles et pages de vente pour identifier les variantes les plus rentables.",
  },
  "store-conversion-lab": {
    title: "Store & Conversion Lab",
    description:
      "Optimisation du taux de conversion (CRO) sur le tunnel de commande COD et réduction de l'abandon de panier.",
  },
  "store-builder": {
    title: "Store Builder",
    description:
      "Créez des pages de destination ultra-rapides et des formulaires de commande 1-clic adaptés au marché tunisien.",
  },
  "automations": {
    title: "Automations COD",
    description:
      "Confirmation automatique par WhatsApp/SMS et relance prédictive des colis en instance de livraison.",
  },
  "integrations": {
    title: "Intégrations Transporteurs",
    description:
      "Synchronisation directe de vos expéditions avec Aramex, Yalidine et vos plateformes e-commerce favorites.",
  },
  "reports": {
    title: "Rapports & Exports Avancés",
    description:
      "Génération de bilans consolidés, rapports comptables certifiés et analyses de rétention client.",
  },
};

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ placeholder: string }>;
}) {
  const { placeholder } = await params;
  const routeInfo = TEAMMATE_ROUTES[placeholder];

  if (!routeInfo) {
    notFound();
  }

  return (
    <ComingSoonPage
      title={routeInfo.title}
      badge={routeInfo.badge}
      description={routeInfo.description}
    />
  );
}
