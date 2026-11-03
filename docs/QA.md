# Checklist QA – WINNIT OS

Demo click-by-click avec valeurs réelles mesurées le **3 novembre 2026**.

---

## Préparation

```bash
# 1. MongoDB en cours (port 27017)
# 2. Backend seed + build + start (port 4000)
cd winnit-backend && npm run seed && npm run build && npm start

# 3. Frontend production build (PWA activée seulement en prod)
cd winnit-frontend && npm run build && npm start
```

**Ouvrir** : http://localhost:3000

---

## 1. Login (factice)

- [ ] Form affiche "Email" et "Mot de passe"
- [ ] Bouton "Se connecter" présent
- [ ] Clic → redirige vers `/profit-os` (pas d'auth réelle)

---

## 2. Profit OS Dashboard

### Filtres période

**IMPORTANT** : Les totaux changent selon l'inclusion du 3 novembre :

- `to=2026-11-03` (exclut le 3 nov) - `curl -s -H "x-workspace-id: ws_maison_ambre" "http://localhost:4000/api/v1/analytics/summary?from=2026-08-05&to=2026-11-03"`:
  - Commandes totales : **588**
  - CA Brut : **77 805 TND** (77 805 000 millimes)
  - Contribution Nette : **24 484,9 TND**
  - Taux refus : **23.5%**

- `to=2026-11-03T23:59:59.999Z` (inclut le 3 nov) - `curl -s -H "x-workspace-id: ws_maison_ambre" "http://localhost:4000/api/v1/analytics/summary?from=2026-08-05&to=2026-11-03T23:59:59.999Z"`:
  - Commandes totales : **600**
  - CA Brut : **79 626 TND** (79 626 000 millimes)
  - Contribution Nette : **25 611,9 TND**
  - Taux refus : **23.1%**

**Tests avec inclusion du 3 nov** :

- [ ] Par défaut : "90 derniers jours"
- [ ] Sélectionner "7 derniers jours" → URL change `?period=7d`
- [ ] Custom range : choisir dates → URL `?from=...&to=2026-11-03T23:59:59.999Z`

### KPIs Header (90d, inclut 3 nov)

`curl -s -H "x-workspace-id: ws_maison_ambre" "http://localhost:4000/api/v1/analytics/summary?from=2026-08-05&to=2026-11-03T23:59:59.999Z"`:

- [ ] **CA Brut** : 79 626 TND
- [ ] **Commandes Totales** : 600
- [ ] **Taux Livraison** : ~77% 
- [ ] **Contribution Nette** : 25 611,9 TND
- [ ] **Marge Nette** : ~32%

### Waterfall 6 étapes

`curl -s -H "x-workspace-id: ws_maison_ambre" "http://localhost:4000/api/v1/analytics/summary?from=2026-08-05&to=2026-11-03T23:59:59.999Z"`:

- [ ] Étape 1 : Revenu Brut = **79 626 TND**
- [ ] Étape 2 : - COGS Produits
- [ ] Étape 3 : - Livraisons
- [ ] Étape 4 : - Publicité Payée
- [ ] Étape 5 : - Pénalité Refus COD
- [ ] Étape 6 : = Contribution Nette = **25 611,9 TND**
- [ ] Chaque étape affiche montant + barre colorée proportionnelle

### Onglet COD (inclut 3 nov)

`curl -s -H "x-workspace-id: ws_maison_ambre" "http://localhost:4000/api/v1/analytics/cod?from=2026-08-05&to=2026-11-03T23:59:59.999Z"`:

- [ ] **Encaissements Attendus** : 79 552 TND
- [ ] **Virements Reçus** : 49 295 TND
- [ ] **En Attente Transporteur** : 30 257 TND
- [ ] Formule : `En Attente = Attendus - Reçus` ✅

### Onglet "Par Produit"

- [ ] Tableau liste 12 produits
- [ ] Colonnes : Nom, Commandes, CA Brut, Contribution, Marge
- [ ] Tri par CA décroissant par défaut
- [ ] Clic header colonne → tri change

### Onglet "Par Transporteur"

- [ ] Affiche Aramex, Sodetel, TND Express
- [ ] Colonnes : Transporteur, Livrées, Refusées, Taux Livraison
- [ ] Aramex devrait avoir ~50% du volume

### Onglet "Par Gouvernorat"

- [ ] Liste gouvernorats tunisiens (Tunis, Ariana, Sfax...)
- [ ] Colonnes : Gouvernorat, Commandes, CA, Taux Livraison
- [ ] Tri disponible

---

## 3. Winners (Classement Produits)

**URL** : http://localhost:3000/winners

### Podium Top 3 (inclut 3 nov)

`curl -s -H "x-workspace-id: ws_maison_ambre" "http://localhost:4000/api/v1/analytics/winners?from=2026-08-05&to=2026-11-03T23:59:59.999Z"`:

- [ ] **#1** : Sahara Gold Cuff Bracelet (score **92**, label "Winner")
- [ ] **#2** : Aura d'Ambre Duo Bundle (score **89**, label "Winner")
- [ ] **#3** : Aura d'Ambre Extrait 50ml (score **87**, label "Winner")
- [ ] Chaque carte affiche : nom, score, icône trophée, breakdown 4 composantes

### Breakdown (anneau scores)

Chaque produit a 4 segments colorés (max 25 pts chacun) :
- [ ] **Marge Nette** : vert si bon
- [ ] **Taux Livraison** : vert si > 80%
- [ ] **ROAS** : vert si > 3
- [ ] **Tendance Volume** : vert si croissance positive

### Liste complète

- [ ] Scrollable, 12 produits au total
- [ ] Labels couleurs :
  - **Winner** (≥70) : vert
  - **À surveiller** (40-69) : jaune
  - **À couper** (<40) : rouge
  - **Données insuffisantes** (<30 commandes) : gris

---

## 4. Simulator (Prix/Volume)

**URL** : http://localhost:3000/simulator

### Sliders

- [ ] **Prix (TND)** : min 50, max 500, step 5
- [ ] **Volume mensuel** : min 10, max 1000, step 10
- [ ] **COGS (TND)** : min 10, max 300, step 5
- [ ] **Taux refus (%)** : min 0, max 50, step 1
- [ ] **CPA (TND)** : min 0, max 200, step 5
- [ ] Déplacer slider → tuiles et courbe se mettent à jour en temps réel

### Tuiles Métriques

4 tuiles affichent (valeurs dépendent sliders) :
- [ ] **CA Mensuel** : prix × volume
- [ ] **Profit Net** : après tous coûts
- [ ] **Marge** : % profit / CA
- [ ] **Breakeven** : volume minimum pour profit = 0

Couleurs statut :
- [ ] Vert : bon
- [ ] Jaune : warning
- [ ] Rouge : mauvais

### Courbe de Profit

- [ ] Axe X : Volume (0 à max slider)
- [ ] Axe Y : Profit Net (TND)
- [ ] Courbe verte : profit selon volume
- [ ] Ligne rouge pointillée : breakeven (profit = 0)
- [ ] Légende : zone recommandée (fond vert clair)
- [ ] Point actuel sur courbe (position slider)

### Scénarios Sauvegardés

- [ ] Liste vide au début
- [ ] Bouton "Sauvegarder" → prompt nom
- [ ] Scénario apparaît dans liste avec date
- [ ] Clic scénario → restaure sliders
- [ ] Bouton poubelle → supprime scénario
- [ ] Scénarios persistent (stockés MongoDB)

---

## 5. Reports (Exports)

**URL** : http://localhost:3000/reports

### Sélecteur Type

- [ ] Radio buttons : Résumé, Commandes, Gagnants, COD, Complet
- [ ] Par défaut : "Résumé" sélectionné

### Boutons Export

- [ ] **CSV** : télécharge fichier `.csv`
- [ ] **Excel** : télécharge fichier `.xlsx`
- [ ] **PDF** : télécharge fichier `.pdf`
- [ ] Nom fichier format : `winnit-{type}-{date}.{ext}`

### Vérification Résumé PDF (inclut 3 nov)

Ouvrir le PDF téléchargé (données depuis `curl ?from=2026-08-05&to=2026-11-03T23:59:59.999Z`) :
- [ ] Titre "Rapport WINNIT OS"
- [ ] Période affichée : dates from/to
- [ ] Section "KPIs Clés" :
  - Commandes Totales : **600**
  - Panier Moyen : **~133 TND**
- [ ] Section "Cascade P&L" :
  - CA Brut : **79 626 TND** (pas 79 626 000 !)
  - Contribution Nette : **25 611,9 TND**
- [ ] Section "Top 5 Produits" :
  - Sahara Gold Cuff Bracelet en premier
- [ ] Section "Statut COD" :
  - Encaissements : **79 552 TND**
  - Virements : **49 295 TND**
- [ ] Numéros de page (Page 1 / X)

### Historique

- [ ] Après export, ligne apparaît dans "Historique des exports"
- [ ] Affiche : type, format, date/heure, nom fichier
- [ ] Historique non persistant (session seulement)

---

## 6. PWA (Progressive Web App)

**UNIQUEMENT EN PRODUCTION** : `npm run build && npm start`

### Install Card (Desktop Chrome)

- [ ] Carte "Installer WINNIT OS" visible en haut de page
- [ ] Bouton "Installer" présent
- [ ] Clic → prompt navigateur natif
- [ ] Accepter → app installée, icône desktop
- [ ] Lancer depuis desktop → ouvre en standalone (pas d'URL bar)

### Install Card (Mobile iOS)

- [ ] Carte affiche hint manuel : "Touchez 📤 puis Ajouter à l'écran d'accueil"
- [ ] Pas de bouton natif (iOS ne supporte pas `beforeinstallprompt`)

### Online Pill

- [ ] Topbar droite : pill "En ligne" (vert)
- [ ] DevTools > Network > Offline
- [ ] Pill devient "Hors ligne" (rouge)
- [ ] Retour Online → redevient vert

### Service Worker

**DevTools > Application > Service Workers** :
- [ ] État : "activated and is running"
- [ ] Version : SW_VERSION = "v1"

**DevTools > Application > Cache Storage** :
- [ ] Cache `winnit-static-v1` contient `/`, `/offline.html`, icônes
- [ ] Cache `winnit-api-v1` contient réponses `/api/v1/*`
- [ ] Cache `winnit-dynamic-v1` contient pages dynamiques

### Offline Mode

1. **DevTools** > Network > **Offline**
2. Recharger page (Cmd+R / Ctrl+R)
   - [ ] Affiche `/offline.html` (page jaune/orange)
   - [ ] Message : "Vous êtes hors ligne"
   - [ ] Logo WINNIT visible
3. Naviguer vers `/profit-os` (cache)
   - [ ] Page charge depuis cache si visitée avant
   - [ ] Sinon → offline.html
4. Retour **Online** → tout fonctionne normalement

### Update Flow

1. Modifier `SW_VERSION` dans `public/sw.js` : `"v1"` → `"v2"`
2. Rebuild : `npm run build && npm start`
3. Recharger page
   - [ ] Toast "Mise à jour disponible" apparaît
   - [ ] Bouton "Recharger"
4. Clic "Recharger"
   - [ ] Page reload
   - [ ] Nouveaux caches `*-v2` créés
   - [ ] Anciens caches `*-v1` supprimés

---

## 7. Responsiveness

### Desktop (>1024px)

- [ ] Navigation sidebar gauche visible
- [ ] Tableau profit-os : toutes colonnes visibles
- [ ] Waterfall : 6 étapes côte à côte

### Tablet (768-1024px)

- [ ] Sidebar collapse en hamburger menu
- [ ] Tableaux : scroll horizontal si nécessaire
- [ ] Simulator : courbe 600px width

### Mobile (<768px)

- [ ] Hamburger menu (3 barres)
- [ ] Winners podium : 3 cartes stacked verticalement
- [ ] Simulator : sliders full width
- [ ] Tableaux : scroll horizontal actif

---

## 8. Dark Mode

- [ ] Topbar : toggle soleil/lune
- [ ] Clic → `data-theme="dark"` appliqué sur `<html>`
- [ ] Fond : noir (#09090b)
- [ ] Texte : clair (#f4f4f5)
- [ ] Surface cards : gris foncé (#141416)
- [ ] Tokens couleurs adaptés (--positive-emerald reste vert)
- [ ] Re-toggle → revient light mode

---

## 9. Performance

### Lighthouse (Production Build)

```bash
# Chrome DevTools > Lighthouse
# Mode: Navigation, Device: Desktop
```

Scores à mesurer (Chrome DevTools > Lighthouse) :
- [ ] **Performance** : à mesurer
- [ ] **Accessibility** : à mesurer
- [ ] **Best Practices** : à mesurer
- [ ] **SEO** : à mesurer
- [ ] **PWA** : ✅ Installable

### Core Web Vitals

À mesurer (Chrome DevTools > Performance) :
- [ ] **LCP** (Largest Contentful Paint) : à mesurer
- [ ] **FID** (First Input Delay) : à mesurer
- [ ] **CLS** (Cumulative Layout Shift) : à mesurer

---

## 10. Vérifications Techniques

### TypeScript

```bash
cd winnit-frontend
npx tsc --noEmit
# Output: (aucune erreur)
```
- [ ] 0 erreurs TypeScript

### Lint

```bash
npm run lint
# Output: ✖ 22 problems (0 errors, 22 warnings)
```
- [ ] 0 erreurs ESLint (warnings OK)

### Tests

```bash
npm run test
# Output: ℹ tests 24, ℹ pass 24, ℹ fail 0
```
- [ ] 24/24 tests passent
  - Finance: waterfall, COD, unit economics
  - Reports: CSV, summary rows, millimes conversion
  - API: winners array structure
  - Validators: phone, promo codes

### Backend Tests

```bash
cd winnit-backend
npm test
# Output: Tests: 210 passed, 210 total
```
- [ ] 210/210 tests passent

---

## 11. Edge Cases

### Dates vides

- [ ] PeriodPicker sans dates → utilise 90d par défaut
- [ ] from > to → affiche erreur "Dates invalides"

### Données manquantes

- [ ] Aucun produit winner → affiche "Aucun produit trouvé"
- [ ] Backend down → error card rouge "Impossible de charger"
- [ ] Refetch auto après 5s

### Millimes 0 ou négatifs

- [ ] Contribution négative → affiche "-5 TND" (pas "-5 000 TND")
- [ ] Montant 0 → affiche "0 TND"

### Pagination orders

- [ ] Plus de 1000 commandes → fetchAll s'arrête après 10 pages
- [ ] Warning console (pas d'erreur UI)

---

## Résultat Attendu

✅ **Toutes checkboxes cochées** = QA validée  
❌ **Une checkbox échoue** = bug à fixer avant release

**Date QA** : 3 novembre 2026  
**Testeur** : [Votre nom]  
**Build** : Production (`npm run build && npm start`)  
**Navigateur** : Chrome 131 / Safari 18 / Firefox 132
