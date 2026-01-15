# DashArchive - Services Backend

## 🔧 Vue d'Ensemble des Services

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVICES (Main Process)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   src/main/services/                                                │
│   ├── ai/            # Intelligence Artificielle                   │
│   ├── analysis/      # Analyse de fichiers                         │
│   ├── core/          # Services fondamentaux                       │
│   ├── fs/            # Système de fichiers                         │
│   ├── planning/      # Moteur de règles                            │
│   ├── security/      # Sécurité                                    │
│   └── testing/       # Tests de charge                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Service (`services/ai/`)

**Fichier principal**: `index.ts`

Gère la classification IA des fichiers.

```typescript
class AIService {
  // Classification zero-shot
  async classifyText(text: string, labels: string[]): Promise<ClassificationResult[]>

  // Suggestion de tags pour images
  async suggestTags(imagePath: string): Promise<string[]>
}
```

| Méthode          | Description                         |
| ---------------- | ----------------------------------- |
| `classifyText()` | Classifie un texte parmi des labels |
| `suggestTags()`  | Génère des tags pour une image      |

---

## 📊 Analysis Service (`services/analysis/`)

**Fichiers**:

- `file-analyzer.ts` - Analyse individuelle
- `batch-analyzer.ts` - Analyse par lot
- `content-extractor.ts` - Extraction de contenu

Analyse les fichiers pour extraire:

- **Métadonnées**: Taille, date, extension
- **Contenu**: Texte extrait (PDF, DOCX...)
- **Signatures**: Hash pour déduplication

```typescript
interface FileAnalysis {
  path: string
  size: number
  extension: string
  content?: string
  hash?: string
}
```

---

## ⚙️ Core Services (`services/core/`)

### ToolsService (`tools.ts`)

Outils agentiques pour l'IA.

```typescript
class ToolsService {
  getDefinitions(): ToolDefinition[]
  executeTool(name: string, args: any): Promise<any>
  organizeFolder(path: string, strategy: string): Promise<string>
  mergeFolders(sources: string[], dest: string): Promise<string>
}
```

### LearningService (`learning.ts`)

Analyse des dossiers pour apprentissage.

```typescript
class LearningService {
  analyzeFolder(path: string): Promise<FolderProfile[]>
}
```

### SchedulerService (`scheduler.ts`)

Planification des tâches périodiques.

```typescript
class SchedulerService {
  scheduleJob(cronExpr: string, task: () => void): void
  unscheduleJob(id: string): void
}
```

### StatsService (`stats.ts`)

Statistiques globales.

```typescript
class StatsService {
  getStats(): Promise<AppStats>
  incrementCounter(key: string): void
}
```

### SettingsService (`settings.ts`)

Gestion des paramètres.

```typescript
class SettingsService {
  get(key: string): any
  set(key: string, value: any): void
  getAll(): Settings
}
```

### UniversalScanner (`universal-scanner.ts`)

Surveillance des dossiers (Chokidar).

```typescript
class UniversalScanner {
  watch(folders: string[]): void
  stop(): void
  onFileChange(callback: (file: FileEvent) => void): void
}
```

---

## 📁 FS Services (`services/fs/`)

### Executor (`executor.ts`)

Exécute les opérations sur le système de fichiers.

```typescript
class FileExecutor {
  move(source: string, dest: string): Promise<void>
  copy(source: string, dest: string): Promise<void>
  delete(path: string): Promise<void>
}
```

### Watcher (`watcher.ts`)

Wrapper autour de Chokidar.

### Queue (`queue.ts`)

Gestion de la file d'attente des opérations.

---

## 📋 Planning Services (`services/planning/`)

### RuleEngine (`engine.ts`)

Moteur de règles pour le routing des fichiers.

```typescript
class RuleEngine {
  evaluate(file: FileInfo, rules: Rule[]): RuleMatch | null
  sortByPriority(rules: Rule[]): Rule[]
}
```

### Planner (`planner.ts`)

Détermine la destination d'un fichier.

```typescript
class Planner {
  planFile(file: FileInfo): Promise<PlanResult>
}
```

### Classifier (`classification.ts`)

Classification des fichiers par type.

---

## 🔒 Security Services (`services/security/`)

### Validator (`validator.ts`)

Validation des chemins et permissions.

```typescript
class SecurityValidator {
  isPathAllowed(path: string): boolean
  sanitizePath(path: string): string
}
```

---

## 🧪 Testing Services (`services/testing/`)

### StressTest (`stress-test.ts`)

Tests de charge pour le système.

```typescript
class StressTest {
  generateChaos(folder: string, fileCount: number): Promise<void>
}
```

---

## 📡 IPC Handlers (`ipc/`)

Chaque service a ses handlers IPC correspondants:

| Handler           | Service          |
| ----------------- | ---------------- |
| `ipc/ai.ts`       | AIService        |
| `ipc/folders.ts`  | UniversalScanner |
| `ipc/files.ts`    | FileExecutor     |
| `ipc/rules.ts`    | RuleEngine       |
| `ipc/settings.ts` | SettingsService  |
| `ipc/tools.ts`    | ToolsService     |
| `ipc/learning.ts` | LearningService  |
| `ipc/debug.ts`    | Debugging        |

---

## 🗄️ Database (`db/`)

SQLite avec les tables:

- `files` - Index des fichiers
- `history` - Historique des actions
- `rules` - Règles personnalisées
- `folders` - Dossiers surveillés
- `settings` - Paramètres

```typescript
// db/index.ts
class Database {
  query(sql: string, params?: any[]): Promise<any[]>
  run(sql: string, params?: any[]): Promise<void>
}
```
