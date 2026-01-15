# DashArchive - Modèles IA

## 🧠 Vue d'Ensemble des Modèles

DashArchive utilise **deux modèles IA** avec des rôles distincts:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MODÈLES IA                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐ │
│  │      MODÈLE CONVERSATIONNEL │   │      MODÈLE CLASSIFICATION  │ │
│  ├─────────────────────────────┤   ├─────────────────────────────┤ │
│  │  Llama-3-8B-Instruct        │   │  BART Zero-Shot             │ │
│  │  (q4f32_1-MLC)              │   │  (Xenova/bart-large-mnli)   │ │
│  ├─────────────────────────────┤   ├─────────────────────────────┤ │
│  │  📍 Localisation: Worker    │   │  📍 Localisation: Main      │ │
│  │  🔧 Framework: Web-LLM      │   │  🔧 Framework: ONNX Runtime │ │
│  │  ⚡ Accélération: WebGPU    │   │  ⚡ Accélération: CPU/WASM  │ │
│  ├─────────────────────────────┤   ├─────────────────────────────┤ │
│  │  Usage:                     │   │  Usage:                     │ │
│  │  - Chat conversationnel     │   │  - Classifier les fichiers  │ │
│  │  - Appels d'outils          │   │  - Suggérer des catégories  │ │
│  │  - Réponses utilisateur     │   │  - Tri automatique          │ │
│  └─────────────────────────────┘   └─────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🦙 Modèle Conversationnel (Llama 3)

### Spécifications

| Propriété        | Valeur                            |
| ---------------- | --------------------------------- |
| **Nom**          | `Llama-3-8B-Instruct-q4f32_1-MLC` |
| **Taille**       | ~4 GB (quantifié 4-bit)           |
| **Framework**    | Web-LLM (MLC AI)                  |
| **Accélération** | WebGPU (GPU local)                |
| **Localisation** | Worker Window (caché)             |

### Fichiers Impliqués

```
src/renderer/
├── worker.html          # Page hébergeant le worker
└── src/worker/
    └── ai.ts            # Script d'initialisation et chat
```

### Configuration

```typescript
// src/renderer/src/worker/ai.ts
const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC'

engine = await CreateMLCEngine(SELECTED_MODEL, {
  initProgressCallback: (progress) => {
    window.api.aiWorker.sendProgress(progress)
  }
})
```

### Utilisation

Le modèle est utilisé pour:

1. **Chat général**: Répondre aux questions de l'utilisateur
2. **Appels d'outils**: Générer du JSON pour les actions
3. **Assistant intelligent**: Comprendre l'intention de l'utilisateur

---

## 📊 Modèle de Classification (BART)

### Spécifications

| Propriété        | Valeur                         |
| ---------------- | ------------------------------ |
| **Nom**          | `Xenova/bart-large-mnli`       |
| **Type**         | Zero-Shot Classification       |
| **Framework**    | Transformers.js + ONNX Runtime |
| **Accélération** | WASM/CPU                       |
| **Localisation** | Main Process                   |

### Fichiers Impliqués

```
src/main/services/ai/
├── index.ts             # AIService (singleton)
└── ai.test.ts           # Tests unitaires
```

### Configuration

```typescript
// src/main/services/ai/index.ts
private textModelName = 'Xenova/bart-large-mnli'

async classifyText(text: string, labels: string[]): Promise<ClassificationResult[]> {
  const result = await this.textClassifier(text, labels, {
    hypothesis_template: 'Ce document est de type {}',
    multi_label: true
  })
  return result.labels.map((label, i) => ({
    label,
    score: result.scores[i]
  }))
}
```

### Utilisation

Le modèle classifie les fichiers en fonction de:

- **Nom du fichier**: `facture_2024.pdf` → "Finance"
- **Contenu (si texte)**: Analyse le texte extrait
- **Labels configurés**: Catégories personnalisées par l'utilisateur

---

## ⚡ Performance et Optimisation

### Web-LLM (Llama 3)

| Aspect                   | Optimisation                   |
| ------------------------ | ------------------------------ |
| **Premier chargement**   | ~30-60s (télécharge le modèle) |
| **Chargements suivants** | ~5-10s (cache local)           |
| **Inférence**            | ~1-3s par réponse              |
| **Mémoire GPU**          | ~4-6 GB VRAM                   |

### BART Classification

| Aspect         | Optimisation           |
| -------------- | ---------------------- |
| **Chargement** | ~2-5s                  |
| **Inférence**  | ~100-500ms par fichier |
| **Mémoire**    | ~200-500 MB RAM        |

---

## 🔧 Fallback et Erreurs

### Si WebGPU non disponible

- Affiche un message d'erreur
- L'IA conversationnelle est désactivée
- La classification BART continue de fonctionner

### Si modèle échoue à charger

- Retry automatique après 5s
- Log de l'erreur
- Fallback vers règles manuelles (pas d'IA)

---

## 📦 Cache des Modèles

Les modèles sont cachés dans:

- **Web-LLM**: IndexedDB du navigateur (WebGPU cache)
- **ONNX**: `~/.cache/huggingface/` (Transformers.js)

Pour vider le cache:

```bash
# IndexedDB: DevTools > Application > Storage > Clear
# ONNX: rm -rf ~/.cache/huggingface/
```
