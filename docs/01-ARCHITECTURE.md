# DashArchive - Vue d'Ensemble de l'Architecture

## 🏗️ Architecture Globale

DashArchive est une application Electron utilisant une architecture **Multi-Processus** classique avec une couche AI innovante.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ELECTRON APP                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    IPC     ┌──────────────┐    IPC    ┌────────┐ │
│  │   RENDERER   │◄──────────►│     MAIN     │◄─────────►│ WORKER │ │
│  │   (React)    │            │   (Node.js)  │           │  (AI)  │ │
│  └──────────────┘            └──────────────┘           └────────┘ │
│         │                           │                       │      │
│         ▼                           ▼                       ▼      │
│  ┌──────────────┐            ┌──────────────┐     ┌──────────────┐ │
│  │  Components  │            │   Services   │     │   Web-LLM    │ │
│  │  Features    │            │   Database   │     │   (WebGPU)   │ │
│  │  Context     │            │   IPC        │     └──────────────┘ │
│  └──────────────┘            └──────────────┘                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Structure des Dossiers

```
src/
├── main/                    # Processus Principal (Node.js)
│   ├── index.ts             # Point d'entrée
│   ├── config/              # Configuration (règles par défaut)
│   ├── db/                  # Base de données SQLite
│   ├── ipc/                 # Handlers IPC (communication)
│   ├── services/            # Logique métier
│   │   ├── ai/              # Service d'IA (classification)
│   │   ├── analysis/        # Analyse de fichiers
│   │   ├── core/            # Services fondamentaux
│   │   ├── fs/              # Système de fichiers
│   │   ├── planning/        # Moteur de règles
│   │   └── security/        # Sécurité
│   └── windows/             # Fenêtres Electron
│
├── renderer/                # Processus Renderer (React)
│   ├── src/
│   │   ├── components/      # Composants UI réutilisables
│   │   ├── features/        # Fonctionnalités (pages)
│   │   ├── context/         # Context React (AIContext)
│   │   ├── hooks/           # Custom Hooks
│   │   ├── services/        # Services côté client (RAG)
│   │   └── worker/          # AI Worker (Web-LLM)
│   └── worker.html          # Page hébergeant l'AI Worker
│
├── preload/                 # Script Preload (Bridge)
│   └── index.ts             # Expose les APIs sécurisées
│
└── shared/                  # Code partagé
    ├── types.ts             # Types TypeScript
    └── constants.ts         # Constantes
```

## 🔄 Les 3 Processus

### 1. Main Process (Node.js)

- Accès complet au système de fichiers
- Gestion de la base de données SQLite
- Services métier (classification, organisation)
- Écoute des événements IPC

### 2. Renderer Process (React)

- Interface utilisateur
- Pas d'accès direct au FS (sécurité)
- Communique via `window.api` (préchargé)

### 3. Worker Window (AI)

- Fenêtre cachée dédiée à l'IA
- Exécute Web-LLM avec WebGPU
- Communique via IPC avec Main/Renderer
