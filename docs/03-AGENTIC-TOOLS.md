# DashArchive - Outils Agentiques (AI Tools)

## 🤖 Vue d'Ensemble

DashArchive implémente une architecture **agentique** où l'IA peut exécuter des actions sur le système de fichiers avec confirmation de l'utilisateur.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE AGENTIQUE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User Input                                                        │
│       │                                                             │
│       ▼                                                             │
│   ┌───────────┐                                                     │
│   │   LLM     │ ← Llama-3-8B via Web-LLM                           │
│   │  (Local)  │                                                     │
│   └─────┬─────┘                                                     │
│         │                                                           │
│         ▼                                                           │
│   ┌───────────┐     Tool Call?    ┌───────────────────────────┐    │
│   │  Parsing  │──────────────────►│   ToolExecutionCard       │    │
│   │  JSON     │                   │   [Confirmer] [Annuler]   │    │
│   └───────────┘                   └─────────────┬─────────────┘    │
│                                                 │                   │
│                                          [Confirme]                 │
│                                                 │                   │
│                                   ┌─────────────▼─────────────┐    │
│                                   │      ToolsService         │    │
│                                   │  (organizeFolder, merge)  │    │
│                                   └─────────────┬─────────────┘    │
│                                                 │                   │
│                                                 ▼                   │
│                                          [FS Modifié]              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Outils Disponibles

### 1. `organize_folder`

**Description**: Trie les fichiers d'un dossier par Date, Type ou Nom.

| Paramètre  | Type                         | Description                           |
| ---------- | ---------------------------- | ------------------------------------- |
| `path`     | `string`                     | Chemin du dossier (absolu ou relatif) |
| `strategy` | `"date" \| "type" \| "name"` | Stratégie de tri                      |

**Exemple de requête utilisateur**:

> "Range mon dossier Images par date"

**JSON généré par l'IA**:

```json
{
  "tool": "organize_folder",
  "args": {
    "path": "images",
    "strategy": "date"
  }
}
```

**Résolution de chemin intelligent**:

- `images` → `/Users/xxx/Pictures`
- `documents` → `/Users/xxx/Documents`
- `bureau` → `/Users/xxx/Desktop`
- `telechargements` → `/Users/xxx/Downloads`

---

### 2. `merge_folders`

**Description**: Fusionne plusieurs dossiers sources vers une destination.

| Paramètre     | Type       | Description                    |
| ------------- | ---------- | ------------------------------ |
| `sources`     | `string[]` | Liste des dossiers à fusionner |
| `destination` | `string`   | Dossier de destination         |

**Exemple de requête utilisateur**:

> "Fusionne les dossiers Vacances2023 et Vacances2024 dans Photos"

**JSON généré par l'IA**:

```json
{
  "tool": "merge_folders",
  "args": {
    "sources": ["Vacances2023", "Vacances2024"],
    "destination": "Photos"
  }
}
```

---

## 📁 Fichiers Clés

| Fichier                                                | Rôle                              |
| ------------------------------------------------------ | --------------------------------- |
| `src/renderer/src/worker/ai.ts`                        | Worker AI (Web-LLM, parsing JSON) |
| `src/main/services/core/tools.ts`                      | Implémentation des outils         |
| `src/main/ipc/tools.ts`                                | Handlers IPC pour les outils      |
| `src/renderer/src/features/Chat/ToolExecutionCard.tsx` | UI de confirmation                |
| `src/renderer/src/hooks/useChat.ts`                    | Hook de gestion du chat           |

---

## 🔒 Sécurité

1. **Confirmation obligatoire**: L'utilisateur doit cliquer "Confirmer" avant toute action.
2. **Pas de suppression**: Les outils déplacent mais ne suppriment jamais.
3. **Résolution contrôlée**: Les chemins sont résolus dans des dossiers système uniquement.
4. **Logs**: Toutes les actions sont loggées via `electron-log`.

---

## 🧠 Prompt System

Le prompt système de l'IA est configuré pour:

1. **Toujours répondre en Français**
2. Générer du **JSON strict** pour les appels d'outils
3. Être **concis et direct**
4. Ne pas "bavarder" quand une action est demandée

```typescript
const toolsSystemPrompt = `
Tu es l'Oracle, l'assistant intelligent de DashArchive.
...
Si l'utilisateur demande une action couverte par ces outils :
1. N'écris AUCUN texte de conversation.
2. Réponds UNIQUEMENT avec le bloc JSON ci-dessous.
...
`
```
