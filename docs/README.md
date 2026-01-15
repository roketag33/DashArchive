# 📚 DashArchive - Documentation

Bienvenue dans la documentation technique de DashArchive !

## 📖 Table des Matières

| #   | Document                                       | Description                               |
| --- | ---------------------------------------------- | ----------------------------------------- |
| 01  | [Architecture](./01-ARCHITECTURE.md)           | Vue d'ensemble de l'architecture Electron |
| 02  | [Flux de Données](./02-DATA-FLOWS.md)          | Comment les données circulent dans l'app  |
| 03  | [Outils Agentiques](./03-AGENTIC-TOOLS.md)     | Les outils IA (organize, merge...)        |
| 04  | [Modèles IA](./04-AI-MODELS.md)                | Llama 3, BART, Web-LLM                    |
| 05  | [Features](./05-FEATURES.md)                   | Pages et fonctionnalités                  |
| 06  | [Services](./06-SERVICES.md)                   | Services backend (Main process)           |
| 07  | [Communication IPC](./07-IPC-COMMUNICATION.md) | Canaux et patterns IPC                    |
| 08  | [Base de Données](./08-DATABASE.md)            | Schéma SQLite et FTS5                     |

---

## 🚀 Démarrage Rapide

```bash
# Installation
yarn install

# Développement
yarn dev

# Tests
yarn test

# Build
yarn build
```

---

## 🏗️ Architecture Résumée

```
┌─────────────────────────────────────────────────────────────────┐
│                      DashArchive                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RENDERER (React)          MAIN (Node.js)         WORKER (AI)  │
│  ┌─────────────┐          ┌─────────────┐        ┌──────────┐  │
│  │ UI/Features │◄────────►│  Services   │◄──────►│ Web-LLM  │  │
│  │ Components  │   IPC    │  Database   │  IPC   │ (WebGPU) │  │
│  └─────────────┘          └─────────────┘        └──────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers

```
src/
├── main/           # Processus principal (Node.js)
│   ├── services/   # Logique métier
│   ├── ipc/        # Handlers IPC
│   └── db/         # SQLite
├── renderer/       # Interface React
│   └── src/
│       ├── features/   # Pages
│       ├── components/ # UI
│       └── worker/     # AI
├── preload/        # Bridge sécurisé
└── shared/         # Types partagés
```

---

## 🤖 Fonctionnalités IA

- **Chat conversationnel** avec Llama 3 (local, WebGPU)
- **Classification** des fichiers avec BART
- **Outils agentiques** (organiser, fusionner dossiers)
- **Recherche intelligente** (Full-Text Search)

---

## 📝 Contribuer

1. Lire la documentation
2. Créer une branche `feature/xxx`
3. Respecter les principes SOLID/DRY/KISS
4. Écrire des tests (TDD)
5. Passer lint + typecheck + build
6. Créer une PR

---

## 📄 Licence

MIT - Voir [LICENSE](../LICENSE)
