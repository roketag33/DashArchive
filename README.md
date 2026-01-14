# DashArchive 📂✨

**DashArchive** est un organisateur de fichiers intelligent et respectueux de la vie privée pour macOS, Windows et Linux. Il met de l'ordre dans le chaos de vos documents grâce à une IA locale générative et des règles proactives.

## 📸 Captures d'écran

<div align="center">
  <img src="docs/images/dashboard.png" alt="Vue Dashboard" width="800" />
  <br>
  <em>Le Dashboard Principal : Glissez-déposez pour organiser instantanément.</em>
</div>

## 🚀 Fonctionnalités Clés

- **👻 Ghost Librarian (V2)** : L'application tourne discrètement en tâche de fond (Tray). Elle veille sur vos dossiers et vous notifie uniquement quand c'est nécessaire.
- **🧠 Double IA Hybride (Hybrid AI Architecture)** :
  - **Classement Rapide** : Utilise **MobileBERT** (via `@xenova/transformers`) pour analyser et trier vos fichiers instantanément en arrière-plan.
  - **Assistant Intelligent** : Utilise **Llama 3** (via `@mlc-ai/web-llm`, WebGPU) pour discuter avec vos documents et comprendre des instructions complexes via le chat.
- **📄 Extraction & OCR** : Capable de lire le texte des PDFs, DOCX et même des images (via `Tesseract.js`) pour un tri basé sur le contenu réel.
- **🔔 Notifications Interactives** : Recevez des alertes avec des actions rapides ("J'ai trouvé 3 factures, les classer ?").
- **⚡️ Performance Native** : Surveillance de fichiers optimisée en C++ (`@parcel/watcher`).
- **↩️ Annulation Sécurisée** : Un clic pour tout annuler en cas d'erreur.

## 📦 Installation

Téléchargez la dernière version pour votre OS depuis la [Page des Releases](https://github.com/roketag33/DashArchive/releases).

- **macOS** : `.dmg`
- **Windows** : `.exe`
- **Linux** : `.AppImage` ou `.deb`

## 🛠️ Développement

### Prérequis

- Node.js 20+
- Yarn

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/roketag33/DashArchive.git

# Installer les dépendances
yarn install
```

### Lancer Localement

```bash
# Démarrer le serveur de développement
yarn dev
```

> **Note**: Le modèle de Chat (Llama 3) sera téléchargé au premier usage (~2-4GB). Le modèle de classement (MobileBERT) est beaucoup plus léger.

### Build pour la Production

```bash
yarn build
```

## 🏗️ Stack Technique

- **Electron** (v30)
- **React** + **TypeScript**
- **TailwindCSS** + **Shadcn/UI**
- **IA & ML** :
  - **@mlc-ai/web-llm** (Llama 3 - Chat & Raisonnement Complexe)
  - **@xenova/transformers** (MobileBERT - Classification Rapide)
  - **Tesseract.js** (OCR Images)
- **Système** :
  - **@parcel/watcher** (Surveillance Fichiers Native)
  - **Better-SQLite3** (Base de données locale)

## 👥 Contribuer

Les contributions sont ce qui rend la communauté open source incroyable. Toute contribution est **grandement appréciée**.

Consultez nos [Directives de Contribution](CONTRIBUTING.md) pour plus de détails.

## 🤝 Code de Conduite

Nous nous engageons à fournir un environnement amical, sûr et accueillant. Merci de lire notre [Code de Conduite](CODE_OF_CONDUCT.md).

## 🛡️ Sécurité

Si vous découvrez une vulnérabilité, merci de consulter notre [Politique de Sécurité](SECURITY.md).

## 📝 Licence

Distribué sous la licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.
