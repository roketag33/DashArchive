# 🧪 Guide de Test & Découverte - DashArchive V2

Ce guide vous accompagne pour prendre en main la version "Proactive Librarian" de DashArchive.

## 🚀 1. Premier Lancement : Le "Ghost Librarian"

DashArchive V2 est conçu pour être discret ("Tray-first").

1.  **Lancer l'app** : `yarn dev`
2.  **Observation** :
    - 👀 **Rien ne s'affiche au centre de l'écran.** C'est normal !
    - 🔔 **Notification** : Vous devriez recevoir une notification système : _"Ghost Librarian is running..."_.
    - ⬇️ **Icône Tray** : Cherchez le petit logo DashArchive dans votre barre des tâches (en haut sur Mac, en bas à droite sur Windows).
3.  **Ouvrir l'interface** :
    - Cliquez sur la notification, OU
    - Cliquez sur l'icône Tray -> "Open Dashboard".

## 🤖 2. Initialisation de l'IA (Llama 3)

La première fois que vous utilisez le Chat, le moteur doit se télécharger.

1.  Ouvrez le Dashboard.
2.  Allez dans l'onglet **"Chat"** (généralement la dernière icône ou via le menu).
3.  **Tapez un message simple** : "Bonjour, qui es-tu ?"
4.  **Observation** :
    - Une barre de progression ou un message "Loading Engine..." va apparaître.
    - ⏳ **Patience** : Le téléchargement (~2-3 GB) peut prendre quelques minutes selon votre connexion.
    - Une fois prêt, l'IA vous répondra.

## 📂 3. Tester le Classement Automatique (MobileBERT)

C'est l'IA "rapide" qui trie vos fichiers.

1.  Allez dans l'onglet **"Dashboard"**.
2.  **Drop Zone** : Glissez un dossier contenant des documents mélangés (PDFs factures, images, textes) sur la zone centrale.
3.  **Observation** :
    - L'application va scanner les fichiers.
    - L'IA (MobileBERT) va analyser chaque contenu.
    - Les fichiers seront groupés par catégories suggérées (Finance, Personnel, etc.).

## 🔔 4. Tester les Notifications Interactives

Pour simuler le comportement proactif :

1.  Laissez l'application tourner en fond (fermez la fenêtre principale, elle se réduit dans le Tray).
2.  _(Développement)_ : Pour l'instant, les notifications sont déclenchées par des événements systèmes.
3.  Pour tester manuellement une notification :
    - Ouvrez la console développeur (Ctrl+Shift+I ou F12).
    - Tapez : `window.api.notifications.send({ title: "Test", body: "Ceci est un test" })`
    - Cliquez sur la notification pour vérifier qu'elle rouvre l'application.

## 🛠 En cas de problème

- **L'IA ne répond pas ?** Vérifiez que votre machine supporte WebGPU (Chrome/Edge/Electron récents le supportent par défaut).
- **Pas de notification ?** Vérifiez que votre OS n'est pas en mode "Ne pas déranger".
