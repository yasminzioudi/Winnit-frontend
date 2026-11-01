# WINNIT OS — Front-End (SaaS E-Commerce COD Tunisie)

Système d'exploitation financière et de rentabilité pour e-commerçants COD en Tunisie (Dinar Tunisien - TND).

---

## 🚀 Démarrage Rapide

```bash
# Lancer le serveur de développement
npm run dev

# Exécuter les tests unitaires purs (node:test)
npm run test

# Vérifier le linting ESLint
npm run lint

# Compiler le projet en production
npm run build
```

---

## 🔑 Comptes de Démonstration (Seed Mock)

Le système initialise automatiquement des comptes dans `localStorage` avec hachage asynchrone Web Crypto SHA-256 + sel aléatoire par utilisateur (*mock client-side, non destiné à la production sans backend dédié*).

| Rôle | Email | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Marchand Démo** | `demo@winnit.tn` | `WinnitDemo2026!` | Compte boutique *Maison Ambre Parfums* (Tunis / Marsa) |
| **Administrateur** | `admin@winnit.tn` | `AdminWinnit2026!` | Compte administrateur plateforme |

---

## 📦 Architecture & Services (Phase 2)

- **Auth & Session** : `lib/services/auth.ts`, `hooks/useAuth.tsx` (TTL 24h, token en `localStorage`).
- **Guards** : `components/auth/AuthGuard.tsx` (protection avec skeleton anti-flash et redirection `?next=`).
- **Inscription Stepper** : `/register` (3 étapes : Compte, Marque/Logistique, Coordonnées Financières Produit avec calcul de profit en direct).
- **Modal d'Activation** : `components/auth/ActivationModal.tsx` (reproduction fidèle du Screenshot 3 avec code promo `LAUNCH2026` et sélection du mode de paiement).
- **Produits** : `lib/services/product.ts` (implémentation `ProductRepository` avec point d'intégration pour l'API produit).
