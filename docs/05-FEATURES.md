# DashArchive - Features (Fonctionnalités)

## 🎯 Vue d'Ensemble des Fonctionnalités

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FEATURES                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│   │ Dashboard │  │   Chat    │  │ DropZone  │  │  History  │       │
│   │    📊     │  │    💬     │  │    📁     │  │    📜     │       │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘       │
│                                                                     │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│   │  Search   │  │ Settings  │  │ Learning  │  │Onboarding │       │
│   │    🔍     │  │    ⚙️     │  │    🧠     │  │    🎓     │       │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard

**Emplacement**: `src/renderer/src/features/Dashboard/`

Le tableau de bord affiche:

- **Statistiques**: Fichiers organisés, espace libéré
- **Activité récente**: Derniers fichiers traités
- **Statut des dossiers surveillés**
- **Graphiques de tendance**

| Composant            | Description            |
| -------------------- | ---------------------- |
| `DashboardPage.tsx`  | Page principale        |
| `StatsCards.tsx`     | Cartes de statistiques |
| `RecentActivity.tsx` | Liste des activités    |
| `FolderStatus.tsx`   | État des dossiers      |

---

## 💬 Chat (Oracle)

**Emplacement**: `src/renderer/src/features/Chat/`

L'assistant IA conversationnel:

- **Chat en français**
- **Appels d'outils** (organize, merge)
- **Feedback visuel** (ToolExecutionCard)

| Composant               | Description                    |
| ----------------------- | ------------------------------ |
| `ChatInterface.tsx`     | Interface complète du chat     |
| `ToolExecutionCard.tsx` | Carte de confirmation d'action |

**Hook associé**: `src/renderer/src/hooks/useChat.ts`

---

## 📁 DropZone

**Emplacement**: `src/renderer/src/features/DropZone/`

Zone de glisser-déposer pour les fichiers:

- **Drag & Drop natif**
- **Multi-fichiers**
- **Prévisualisation**
- **Routing automatique** (via règles)

| Composant         | Description             |
| ----------------- | ----------------------- |
| `DropZone.tsx`    | Zone de drop principale |
| `FilePreview.tsx` | Aperçu des fichiers     |

**Fenêtre dédiée**: `src/main/windows/DropZoneWindow.ts`

---

## 📜 History

**Emplacement**: `src/renderer/src/features/History/`

Historique des actions:

- **Liste des fichiers traités**
- **Filtrage par date/type**
- **Actions: Annuler, Voir**

| Composant         | Description       |
| ----------------- | ----------------- |
| `HistoryPage.tsx` | Page d'historique |

---

## 🔍 Search (Spotlight)

**Emplacement**: `src/renderer/src/features/Search/` et `Spotlight/`

Recherche intelligente:

- **Full-Text Search** (SQLite FTS5)
- **Raccourci clavier** (Cmd+K / Ctrl+K)
- **Résultats instantanés**

| Composant            | Description        |
| -------------------- | ------------------ |
| `SmartSearch.tsx`    | Barre de recherche |
| `SpotlightModal.tsx` | Modal Spotlight    |

**Service**: `src/renderer/src/services/RAGService.ts`

---

## ⚙️ Settings

**Emplacement**: `src/renderer/src/features/Settings/`

Configuration de l'application:

- **Dossiers surveillés**
- **Règles de tri**
- **Préférences générales**
- **Thème (dark/light)**

| Composant           | Description          |
| ------------------- | -------------------- |
| `SettingsPage.tsx`  | Page des paramètres  |
| `RuleEditor.tsx`    | Éditeur de règles    |
| `FolderManager.tsx` | Gestion des dossiers |

---

## 🧠 Learning (Cerveau)

**Emplacement**: `src/renderer/src/features/Learning/`

Analyse et apprentissage:

- **Scan de dossiers existants**
- **Détection de patterns**
- **Suggestions de règles**

| Composant          | Description    |
| ------------------ | -------------- |
| `LearningPage.tsx` | Page d'analyse |

**Service**: `src/main/services/core/learning.ts`

---

## 🎓 Onboarding

**Emplacement**: `src/renderer/src/features/Onboarding/`

Assistant de première utilisation:

- **Configuration initiale**
- **Choix des dossiers**
- **Activation des features**

| Composant             | Description                |
| --------------------- | -------------------------- |
| `OnboardingModal.tsx` | Modal d'onboarding         |
| `SmartPopup.tsx`      | Popups d'aide contextuelle |

---

## 🗂️ Structure des Features

Chaque feature suit cette structure:

```
features/
└── [FeatureName]/
    ├── [FeatureName]Page.tsx    # Page principale (route)
    ├── components/               # Sous-composants
    │   ├── ComponentA.tsx
    │   └── ComponentB.tsx
    └── hooks/                    # Hooks spécifiques (optionnel)
        └── useFeature.ts
```

---

## 🔗 Routing

Les routes sont définies dans `App.tsx`:

| Route       | Feature   |
| ----------- | --------- |
| `/`         | Dashboard |
| `/oracle`   | Chat      |
| `/dropzone` | DropZone  |
| `/history`  | History   |
| `/settings` | Settings  |
| `/learning` | Learning  |
