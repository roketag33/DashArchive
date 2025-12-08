# Cahier des charges — File Organizer intelligent (Electron)

## 0) Résumé

Application desktop Electron permettant d’analyser un dossier (ex. **Downloads**), de **proposer un plan de tri** basé sur des règles et presets, puis d’exécuter ce tri de manière **sécurisée**, **réversible (Undo)** et **observable** (logs/progress).

Objectif principal : démontrer une maîtrise solide d’Electron (architecture main/preload/renderer, IPC, sécurité), du filesystem, d’une UX desktop propre, et d’une conception “safe-by-default”.

---

## 1) Objectifs pédagogiques et techniques

### 1.1 Objectifs

* Construire une application Electron complète et crédible.
* Mettre en avant :

  * Accès système (Node FS) côté **main process**.
  * UX de preview + exécution avec progression.
  * **Dry-run** par défaut.
  * **Journal d’opérations** + **Undo**.
  * IPC **minimale, typée et sécurisée**.
  * Packaging multi-OS.

### 1.2 Indicateurs de réussite

* L’utilisateur comprend en moins de 30 secondes :

  1. scan → 2) plan → 3) appliquer → 4) annuler.
* Aucune action destructive sans confirmation explicite.
* L’Undo fonctionne sur une opération complète.
* L’app reste fluide sur un dossier de 2 000–10 000 fichiers.

---

## 2) Périmètre

### 2.1 MVP (obligatoire)

* Sélection d’un dossier cible.
* Scan + inventaire.
* Système de **règles** + **presets**.
* Génération d’un **plan de tri** (dry-run).
* Preview claire du plan.
* Exécution du plan avec progression.
* Gestion des conflits de noms.
* Journalisation + **Undo**.
* Historique des opérations.

### 2.2 V1+ (optionnel “wow”)

* Watch mode (surveillance d’un dossier).
* Quarantaine/Staging.
* Détection de doublons (heuristique simple).
* Statistiques (fichiers triés par type/volume).
* Import/export des règles.

### 2.3 Hors scope (pour ce cours)

* Synchronisation cloud.
* IA réelle (LLM) pour classification.
* Gestion avancée de permissions par utilisateur.
* Optimisations extrêmes (dédoublonnage cryptographique total sur TB de données).

---

## 3) Personas et cas d’usage

### 3.1 Persona principal

* Étudiant/dev qui télécharge beaucoup de fichiers.
* Besoin de rendre un dossier lisible et structuré rapidement.

### 3.2 User stories clés

1. **En tant qu’utilisateur**, je choisis un dossier et je lance un scan.
2. Je vois la liste des fichiers et un résumé (types, tailles, recents).
3. Je sélectionne un preset.
4. Je consulte un **plan de tri** détaillé avant toute action.
5. Je confirme et je vois une barre de progression.
6. Je peux annuler le dernier tri complet.
7. Je peux sauvegarder mes règles et les réutiliser.

---

## 4) Parcours utilisateur (UX)

### 4.1 Écran 1 — Sélection du dossier

* Bouton : **Choisir un dossier**.
* Affichage du chemin sélectionné.
* Bouton : **Scanner**.

### 4.2 Écran 2 — Résultats du scan

* Tableau des fichiers :

  * Nom, extension, taille, date modif, catégorie.
* Résumé :

  * Nombre total, taille totale.
  * Répartition par type.
* Actions :

  * **Choisir un preset** ou **Configurer des règles**.

### 4.3 Écran 3 — Règles et presets

* Presets prêts à l’emploi :

  * “Nettoyage de Downloads”.
  * “Organisation Photos”.
  * “Archive Documents”.
* Éditeur de règles (simple) :

  * Type de règle
  * Condition(s)
  * Destination
  * Priorité
* Bouton : **Générer le plan**.

### 4.4 Écran 4 — Preview du plan (Dry-run)

* Tableau des opérations proposées :

  * Source → Destination
  * Règle appliquée
  * Statut (OK / Conflit / Ignoré)
* Filtres :

  * par règle
  * par type fichier
  * par statut
* Résolution conflits :

  * Renommer auto
  * Ignorer
  * Écraser (désactivé par défaut)
* Bouton : **Appliquer**.

### 4.5 Écran 5 — Exécution

* Barre de progression.
* Compteurs :

  * fichiers traités / total
  * taille totale traitée
* Logs d’erreurs en temps réel.
* Bouton : **Annuler l’opération en cours** (arrêt propre).

### 4.6 Écran 6 — Historique & Undo

* Liste des opérations datées.
* Pour chaque opération :

  * nb fichiers
  * règles utilisées
  * erreurs éventuelles
* Bouton : **Undo**.

---

## 5) Logique fonctionnelle

### 5.1 Scan

Le scan construit un inventaire sans modifier le système de fichiers.

**Données à collecter** :

* Chemin complet
* Nom
* Extension
* Taille
* Dates (création/modif)
* Catégorie calculée
* Optionnel : hash léger (doublons)

**Contraintes** :

* Scanner par lots pour éviter de bloquer l’UI.
* Remonter un progress event régulier.

### 5.2 Classification (tagging)

Classification déterministe basée sur extension/heuristiques :

* image, video, audio, document, archive, dev, executable, other.

### 5.3 Moteur de règles

* Règles **ordonnées par priorité**.
* “First match wins”.
* Possibilité d’une règle fallback.

**Types de règles MVP** :

* `extension`
* `namePattern` (regex ou startsWith)
* `size`
* `category`
* `date` (année/mois)

### 5.4 Templates de destination

Support de placeholders :

* `{year}` `{month}` `{day}`
* `{ext}`
* `{category}`
* `{name}` (sans extension)

Exemple :

* `Images/Camera/{year}/{month}`
* `Documents/PDF/{year}`

### 5.5 Plan de tri (dry-run)

Le plan est une liste d’opérations :

* from
* to
* ruleId
* status
* conflictStrategy

Aucune action FS à ce stade.

### 5.6 Exécution

* Création des sous-dossiers si nécessaire.
* Déplacement :

  * `rename` si possible
  * sinon `copy + delete` (avec prudence)
* Relever et afficher chaque erreur.

### 5.7 Gestion des conflits

Stratégie par défaut : **Renommer automatiquement**.

Règles de renommage :

* `file.txt` → `file (1).txt` → `file (2).txt`

### 5.8 Journal d’opérations

À la fin d’une exécution :

* stocker un journal complet.
* inclure :

  * operationId
  * date
  * dossier ciblé
  * règles utilisées (version)
  * liste des moves effectifs
  * erreurs

### 5.9 Undo

* Inverser le journal : `to → from`.
* Vérifier l’existence des fichiers.
* Gérer les cas limites :

  * fichier déplacé manuellement entre temps
  * conflit inverse

Par défaut en cas d’incertitude :

* ne rien détruire
* signaler une erreur explicite.

---

## 6) Format de règles (JSON)

### 6.1 Modèle proposé

```json
[
  {
    "id": "photos-camera",
    "priority": 100,
    "type": "namePattern",
    "pattern": "^IMG_",
    "destination": "Images/Camera/{year}/{month}"
  },
  {
    "id": "pdf-by-year",
    "priority": 90,
    "type": "extension",
    "match": ["pdf"],
    "destination": "Documents/PDF/{year}"
  },
  {
    "id": "large-files",
    "priority": 80,
    "type": "size",
    "minBytes": 1073741824,
    "destination": "BigFiles"
  },
  {
    "id": "fallback-by-ext",
    "priority": 0,
    "type": "fallback",
    "destination": "Other/{ext}"
  }
]
```

### 6.2 Validation

* unique `id`
* `priority` numérique
* destination non vide
* interdiction de destinations absolues hors dossier racine si mode “safe sandbox”.

---

## 7) Données et stockage

### 7.1 Stockage MVP

* Fichiers JSON locaux :

  * `rules.json`
  * `presets.json`
  * `history.json`
  * `settings.json`

### 7.2 Versioning

* Chaque fichier de config inclut une version :

  * `schemaVersion`.

---

## 8) Architecture technique

### 8.1 Structure recommandée

* `/main`

  * scan
  * planner
  * executor
  * history
  * watchers (optionnel)
* `/preload`

  * API exposée minimale
* `/renderer`

  * UI
  * state management
  * composants
* `/shared`

  * types
  * schémas de règles

### 8.2 Principes

* Logique métier testable hors UI.
* IPC uniquement pour :

  * actions FS
  * accès à l’historique
  * watch mode

### 8.3 API preload (exemple)

```ts
scanFolder(path: string): Promise<ScanResult>
buildPlan(path: string, rules: Rule[]): Promise<Plan>
applyPlan(plan: Plan): Promise<OperationSummary>
undo(operationId: string): Promise<UndoSummary>
getHistory(): Promise<HistoryEntry[]>
```

---

## 9) Sécurité Electron

### 9.1 Paramètres obligatoires

* `contextIsolation: true`
* `nodeIntegration: false`
* `sandbox: true` si compatible avec la stack UI
* Preload minimal et strict.

### 9.2 Sécurité fonctionnelle

* **Safe-by-default** : dry-run obligatoire avant first apply.
* Protection chemins sensibles (opt) :

  * refuser racines système
  * refuser dossiers OS critiques

---

## 10) Observabilité et logs

### 10.1 Logs applicatifs

* Niveaux : info / warn / error.
* Log des décisions de règles en mode debug.

### 10.2 Rapport d’exécution

* Résumé final :

  * nb fichiers déplacés
  * nb ignorés
  * nb erreurs
  * temps total

---

## 11) Performance

### 11.1 Recommandations

* Scan par chunks.
* Éviter de charger le contenu des fichiers en mémoire.
* UI alimentée par événements progressifs.

### 11.2 Limites cibles

* Dossier 10k fichiers : UI réactive et scan < 20–40s selon machine (objectif indicatif).

---

## 12) Tests

### 12.1 Unit tests (fortement recommandé)

* Parser/validator de règles.
* Résolution de destination depuis templates.
* BuildPlan déterministe.
* Stratégies de conflits.

### 12.2 Integration tests

* Utiliser un dossier temporaire.
* Créer un set de fichiers de test.
* Vérifier apply + undo.

---

## 13) Packaging et distribution

### 13.1 Objectif

* Build Windows/macOS/Linux.
* Icône et metadata propres.

### 13.2 Outils

* electron-builder ou équivalent.

---

## 14) Roadmap conseillée (cours)

### Sprint 1 — Fondations

* Setup Electron + UI (Vite/React ou autre).
* Choix dossier + écran principal.
* IPC de base.

### Sprint 2 — Scan

* Inventaire fichiers.
* Catégorisation simple.
* UI de résultats.

### Sprint 3 — Règles + Plan

* Modèle JSON.
* Éditeur simple.
* Génération dry-run.

### Sprint 4 — Exécution

* Apply + progress.
* Gestion conflits.

### Sprint 5 — Historique + Undo

* Journal d’opérations.
* Undo complet.

### Sprint 6 — Wow (option)

* Watch mode OU Quarantaine OU Doublons.

---

## 15) Critères d’acceptation MVP

* [ ] L’utilisateur peut sélectionner un dossier et scanner.
* [ ] L’app affiche un inventaire cohérent.
* [ ] Des presets existent et sont utilisables immédiatement.
* [ ] L’utilisateur peut créer une règle simple.
* [ ] Un plan de tri est généré sans action FS.
* [ ] La preview liste les opérations et les conflits.
* [ ] L’exécution réalise les moves correctement.
* [ ] Un historique est créé.
* [ ] Un Undo annule une opération précédente.
* [ ] Les paramètres de sécurité Electron sont activés.

---

## 16) Notes de présentation (pour la démo)

### Pitch démo en 60–90 secondes

1. Ouvrir l’app.
2. Choisir `Downloads`.
3. Scan.
4. Preset “Nettoyage de Downloads”.
5. Montrer preview + conflits.
6. Appliquer.
7. Montrer historique.
8. Undo.

### Ce que cette app démontre

* Maîtrise Electron (IPC, séparation main/renderer/preload).
* Conception orientée sécurité et expérience utilisateur.
* Gestion du filesystem avec prudence.
* Architecture modulaire et testable.
* Capacité à livrer une app distribuable.

---

## 17) Annexes

### 17.1 Presets proposés (MVP)

* **Downloads Clean**

  * Images → `Images/{year}/{month}`
  * PDF → `Documents/PDF/{year}`
  * Archives → `Archives/{year}`
  * Exécutables → `Installers`
  * Gros fichiers → `BigFiles`
  * Fallback → `Other/{ext}`

* **Photos Organizer**

  * `IMG_*` → `Images/Camera/{year}/{month}`
  * autres images → `Images/Other/{year}/{month}`

* **Documents Archive**

  * Documents → `Documents/{year}/{month}`

### 17.2 Modes de sécurité recommandés

* **Mode strict (par défaut)**

  * Destinations uniquement **dans** le dossier racine scanné.
* **Mode avancé (option)**

  * Autoriser une destination custom choisie explicitement.

---

## 18) Conclusion

Ce cahier des charges structure une application Electron complète, réaliste et démonstrative. Le cœur de la valeur repose sur le trio : **scan → plan → appliquer**, renforcé par une **gestion de risques** (dry-run, conflits, journal, undo).

L’implémentation doit privilégier : simplicité, robustesse, sécurité et lisibilité du code pour maximiser l’impact en contexte de cours.
