# 🎓 Préparation Questions/Réponses - Soutenance DashArchive

Ce document liste les questions probables que ton professeur ou le jury pourrait poser, avec des éléments de réponse techniques et pertinents.

## 🏗️ Architecture & Choix Techniques

### Q: Pourquoi avoir choisi Electron alors qu'il est réputé lourd ?

**R:**

- **Nécessité d'accès Système bas niveau :** DashArchive doit manipuler le système de fichiers (déplacer, renommer, scanner) et utiliser des modules natifs (C++) comme `@parcel/watcher` pour la surveillance performante. Un simple site Web ne peut pas faire ça.
- **Support GPU Local :** Electron permet d'accéder facilement au GPU via WebGPU pour faire tourner Llama 3 localement.
- **Écosystème unifié :** Permet d'utiliser React/TypeScript pour l'UI tout en ayant un backend Node.js puissant.

### Q: Expliquez votre architecture multi-processus. Pourquoi un Worker séparé ?

**R:**

- L'application est divisée en 3 processus principaux :
  1.  **Main Process :** Gère le cycle de vie de l'app, les fenêtres, et les opérations système critiques (Fichier, DB).
  2.  **Renderer :** L'interface utilisateur (React). Elle doit rester fluide à 60fps.
  3.  **AI Worker (Hidden Renderer) :** C'est la clé. Les modèles IA (Llama 3) sont lourds et peuvent bloquer le fil d'exécution. En les isolant dans une fenêtre cachée dédiée, l'UI ne gèle jamais, même quand l'IA "réfléchit" à fond.
- Communication via **IPC (Inter-Process Communication)** asynchrone sécurisé.

### Q: Comment garantissez-vous la sécurité des échanges entre ces processus ?

**R:**

- Utilisation de `contextIsolation: true` et `nodeIntegration: false`.
- **Preload Bridge :** Le Renderer n'a pas accès direct à Node.js. Il passe par un "pont" (`contextBridge`) qui n'expose que des méthodes spécifiques (`ai.chat()`, `fs.organize()`) et non l'API complète.

### Q: Quelle est la structure du projet ?

**R:**

- **`src/main`** : Le Chef d'Orchestre (Node.js). Contient la logique backend, l'accès BDD (`services/core/db`), les watchers (`services/fs`), et les handlers IPC qui répondent aux demandes du Frontend.
- **`src/renderer`** : La Vitrine (React). Interface utilisateur, Components Shadcn, et hooks (`useChat`).
- **`src/renderer/worker`** : L'Usine Cachée. Contient le code spécifique à la fenêtre invisible qui charge les modèles IA WebLLM.
- **`src/preload`** : La Douane. Scripts qui s'exécutent avant le Renderer pour exposer des APIs sécurisées via `contextBridge`.
- **`src/shared`** : Le Dictionnaire. Types TypeScript partagés (Interfaces `FileObject`, `Rule`, `Message`) pour garantir que tout le monde parle la même langue.

### Q: Pouvez-vous tracer le chemin d'une requête IA (IPC) ?

**R:**
Prenons l'exemple où l'utilisateur demande "Trie mes factures" :

1.  **Renderer (React)** : L'utilisateur clique. Le composant appelle `window.ai.chat("Trie mes factures")`.
2.  **Preload** : Intercepte l'appel et l'envoie via `ipcRenderer.invoke('ai:chat', ...)` au Main Process.
3.  **Main Process** : Reçoit la demande. Il ne fait pas le calcul lui-même ! Il le relaye au **Worker** via `workerWindow.webContents.send('ai:chat', ...)`.
4.  **Worker (Hidden)** : Reçoit le message, fait tourner Llama 3 (WebGPU), et génère la réponse token par token.
5.  **Retour** : Le Worker renvoie les tokens au Main, qui les renvoie au Renderer via `mainWindow.webContents.send('ai:on-token')`.
    => C'est ce ping-pong qui permet à l'interface de rester fluide pendant que le GPU travaille.

---

## 🤖 Intelligence Artificielle (Local-First)

### Q: Pourquoi du "Local-First" ? C'est plus compliqué que d'appeler l'API OpenAI.

**R:**

- **Privacy (Vie Privée) :** C'est un gestionnaire de fichiers personnels. Envoyer les factures ou photos d'un utilisateur dans le cloud est inacceptable niveau confidentialité.
- **Offline :** L'app doit marcher sans internet.
- **Coût :** Pas d'abonnement API à payer pour l'utilisateur.

### Q: Quels modèles utilisez-vous et pourquoi ?

**R:**

- **Llama 3 8B (via WebLLM) :** Pour le raisonnement complexe (Chat Oracle). C'est le meilleur rapport intelligence/poids actuel pour tourner sur un laptop grand public.
- **MobileBERT :** Pour la classification de texte (rapide, léger). Pas besoin d'un LLM géant pour savoir si un PDF est une facture.
- **ResNet-50 :** Pour la classification d'images (Computer Vision classique et efficace).

### Q: Comment gérez-vous le problème du téléchargement des modèles (plusieurs Go) ?

**R:**

- Les modèles sont mis en cache localement après le premier téléchargement.
- On utilise des versions quantifiées (q4f32) pour réduire la taille (ex: Llama 3 ~4Go au lieu de 15Go+) sans trop perdre en précision.

---

## 💾 Données & Performance

### Q: Comment gérez-vous la base de données ?

**R:**

- **SQLite (via `better-sqlite3`) :** C'est le standard pour les apps locales. Fichier unique, pas de serveur à installer.
- **Full-Text Search (FTS5) :** On utilise le module FTS de SQLite pour permettre une recherche ultra-rapide dans le contenu indexé des documents.

### Q: Si je glisse 1000 fichiers dans la DropZone, l'app plante-t-elle ?

**R:**

- Non, car le traitement est **asynchrone** et mis en file d'attente (Queue).
- L'UI est virtualisée (avec `react-window`) pour afficher de très longues listes sans ralentir le DOM.

---

## 🐛 Difficultés Rencontrées

### Q: Quel a été le plus gros défi technique ?

**R:** _(Choisis-en un vrai)_

1.  **L'intégration des modules natifs (`node-gyp`) :** Faire marcher `@parcel/watcher` et `better-sqlite3` sur différentes plateformes (Mac/Win) et surtout dans la CI GitHub Actions (problème de compilation/SSH réglé récemment).
2.  **La communication avec le Worker IA :** Gérer l'état asynchrone de l'IA (chargement, réponse streamée token par token) et l'afficher fluidement dans l'UI via IPC était complexe.

---

## 🔮 Évolutions Futures

### Q: Que manque-t-il pour une v3.0 ?

**R:**

1.  **Support RAG (Retrieval-Augmented Generation) complet :** Permettre à Llama 3 de "lire" vraiment tout le contenu de vos fichiers pour répondre (actuellement indexé sommairement).
2.  **Plugin System :** Permettre aux devs de créer leurs propres règles ou connecteurs (ex: Google Drive, Dropbox).
