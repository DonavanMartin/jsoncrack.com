# 🎯 Features Guide - Multi-JSON System

## 📋 Table des matières

1. [Gestion Multi-JSON](#-gestion-multi-json)
2. [Analyse Intelligente](#-analyse-intelligente)
3. [Optimisations](#-optimisations)
4. [Relations & Navigation](#-relations--navigation)
5. [Interface Visuelle](#-interface-visuelle)
6. [Workflows](#-workflows)

---

## 🗂️ Gestion Multi-JSON

### Importer plusieurs JSON

**Où:** MultiJSONImportModal

**Comment:**
1. Cliquer sur `+` bouton ou `File → Importer un JSON`
2. Donner un nom au JSON
3. Sélectionner le type:
   - **Classe**: Schéma réutilisable (ex: UserSchema)
   - **Instance**: Données concrètes (ex: users.json)
4. Importer via fichier `.json` ou paste manuel
5. JSON est automatiquement analysé et stocké en mémoire

**Métadonnées:**
- `name`: Identifiant visible
- `description`: Documentation optionnelle
- `type`: class | instance
- `tags`: Étiquettes personnalisées (futures)

**Stockage:**
- localStorage par défaut
- Limite: ~5-10MB par navigateur
- Pour gros volumes: migrer à IndexedDB

---

### Gérer la bibliothèque

**Panneau:** JSONLibraryPanel (onglet Bibliothèque)

**Fonctionnalités:**
- ✅ Lister tous les JSON importés
- ✅ Filtrer par type (Classes/Instances)
- ✅ Recherche par nom/description
- ✅ Sélectionner actif (highlight)
- ✅ Supprimer avec confirmation
- ✅ Badge "relations" (nb de liens)
- ✅ Dates de création/modification

**Raccourcis:**
- Double-clic → Sélection + édition
- Drag-drop (future): Réorganiser
- Ctrl+K: Recherche rapide

---

## 🔬 Analyse Intelligente

### Analyse automatique de schémas

Lors de l'import, chaque JSON est automatiquement analysé:

**Données collectées:**
- Type: object, array, string, number, boolean, null
- Profondeur maximale
- Occurrences par champ
- Échantillons de valeurs
- Structure imbriquée complète

**Complexité (0-100):**
```
complexité = depth * (10 + uniqueFields * 5)
capped à 100
```

**Exemple:**
```json
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

**Résultat analyse:**
```
root:
  type: object
  children:
    users:
      type: array
      itemType:
        type: object
        children:
          id: {type: number}
          name: {type: string}
  complexity: ~35
```

---

### Détection de relations

Comparer automatiquement les schémas pour trouver:

**Types de relations détectées:**
1. **schema-match** (>50% similarité)
   - Même types de champs
   - Noms similaires
   → Suggère classe commune

2. **reference** (détection future)
   - Champ contient ID d'autre JSON
   → Suggère normalisation

3. **common-field** (détection future)
   - Champs partagés
   → Suggère extraction

**Confiance (0-1):**
Message de similarité structurelle (0.5 = 50%)

---

## ⚡ Optimisations

### Analyser les opportunités

**Panneau:** OptimizationsPanel (onglet Optimisations)

### Types de suggestions

#### 1️⃣ **extract-schema** (Sévérité: variable)
**Quand:** Structures communes en plusieurs JSON
```json
// Instance 1
{"user": {"id": 1, "name": "Alice", "email": "a@x.com"}}

// Instance 2
{"user": {"id": 2, "name": "Bob", "email": "b@x.com"}}

// ↓ Suggestion
// Créer classe UserClass
// Utiliser $ref en instances
```
**Économies:** Complexité -20%, KB -10%

#### 2️⃣ **normalize-array** (Sévérité: high si >1000)
**Quand:** Arrays avec beaucoup d'éléments
```json
{
  "products": [
    {"id": 1, "name": "A", ...40 champs},
    {"id": 2, "name": "B", ...40 champs},
    ... (1000 éléments)
  ]
}
```
**Problème:** Verbosité, redondance
**Solution:** 
- Extraire schéma → classe
- Array de références simples
- Lookup table séparé

**Économies:** Size: -500KB, Complexity: -60%

#### 3️⃣ **deduplicate** (Sévérité: medium)
**Quand:** Valeurs répétées (>30%)
```json
{
  "users": [
    {"role": "admin", ...},
    {"role": "admin", ...},  // Répétition
    {"role": "user", ...}
  ]
}
```
**Suggestion:** Utiliser énumération
```typescript
type Role = "admin" | "user";
```
**Économies:** Size: -5-15% du fichier

#### 4️⃣ **refactor** (Sévérité: low-medium)
**Quand:** Complexité excessive (>80) ou profondeur >7
**Suggestions:**
- Normaliser structures imbriquées
- Aplatir arrays d'objets
- Extraire sous-documents

---

### Impact & Économies

**Impact (0-100):**
```
= Nombre de problèmes affectés
  ÷ Taille total du JSON
  × 100
```

**Économies estimées:**
- `sizeKB`: Réduction taille fichier
- `complexity`: Réduction complexité (%)

---

## 🔗 Relations & Navigation

### Visualiser les relations

**Panneau:** RelationsPanel (onglet Relations)

**Affichage:**
1. **Info JSON sélectionné**
   - Nom, type, description
   - Nombre de relations directes

2. **Relations directes**
   - Graphe source → target
   - Type de relation
   - Confiance (%)

3. **Graphe de dépendances** (3 niveaux)
   ```
   Niveau 0: JSON actuel
     ↓
   Niveau 1: JSON directement liés
     ↓
   Niveau 2: JSON liés à ceux de niveau 1
   ```

**Navigation:**
- Cliquer sur nœud → Change sélection
- DoubleClick → Éditer

---

### Comparaisons structurelles

**Panneau:** ComparisonsView (onglet Comparaisons)

**Métrique de similarité:**
```
= Champs communs
  ÷ Union(champs1, champs2)
  × 100 [%]
```

**Affichage:**
- Barre de similarité (0-100%)
- Champs communs (highlight vert)
- Différences (count)
- **Recommandation auto:**
  - \>70%: Extraire classe commune (RECOMMANDÉ)
  - 40-70%: Classe partielle possible
  - <40%: Structure trop différente

---

## 🎨 Interface Visuelle

### Layouts & Panneaux

**Option 1: Multi-panel workspace** (Recommandé)
```
┌──────────────┬──────────────────┐
│ Bibliothèque │  Éditeur/Graphe  │
│              │                  │
│ - Import     │                  │
│ - Filter     │                  │
│ - Search     │                  │
│              │                  │
│ + Optimisations (onglet 2)      │
│ + Relations (onglet 3)          │
│ + Comparaisons (onglet 4)       │
└──────────────┴──────────────────┘
```

**Option 2: Dashboard séparé**
```
/editor/dashboard
Statistiques globales
Recommandations
Charts
```

### Composants réutilisables

Tous les composants supportent:
- ✅ Dark/Light mode
- ✅ Responsive (mobile, tablet, desktop)  
- ✅ Keyboard shortcuts
- ✅ Accessibility (ARIA)

### Icônes & Badges

```
Classes: 🏗️ ou "C"
Instances: 📄 ou "D"
Optimisations: ⚡
Relations: 🔗
Comparaisons: 🔄
Sévérité haute: 🔴 (red)
Sévérité moyen: 🟠 (orange)
Sévérité basse: 🟢 (green)
```

---

## 📞 Workflows

### Workflow 1: Analyser une API

**Objectif:** Optimiser structure de réponse API

**Étapes:**
1. Exporter réponse GET endpoint 1 → Import "users"
2. Exporter réponse GET endpoint 2 → Import "products"
3. Aller onglet "Optimisations" → Voir suggestions
4. Aller onglet "Comparaisons" → Voir similarités
5. Créer classe commune → "BaseEntity"
6. Refactoriser instances pour utiliser classe

**Résultat:** API payload -30%, complexité -40%

---

### Workflow 2: Normaliser base de données

**Objectif:** Passer de JSON document-oriented à relationnel

**Étapes:**
1. Importer document complet (classes + instances)
2. Tag comme "class": schémas
3. Tag comme "instance": données example
4. Onglet "Optim" → Voir refactor suggestions
5. Créer 3-5 classes normalisées
6. Transformer instances avec références
7. Export → créer migrations DB

**Résultats:** Données -40%, intégrité +90%

---

### Workflow 3: Documenter API

**Objectif:** Générer documentation + types TypeScript

**Étapes:**
1. Importer tous les endpoints comme
