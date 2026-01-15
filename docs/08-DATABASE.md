# DashArchive - Base de Données

## 🗄️ Vue d'Ensemble

DashArchive utilise **SQLite** comme base de données locale, avec **Full-Text Search (FTS5)** pour la recherche.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BASE DE DONNÉES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Location: ~/.dasharchive/database.db                              │
│   Engine: SQLite 3                                                  │
│   ORM: better-sqlite3 (sync)                                        │
│                                                                     │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   │
│   │  files    │   │  history  │   │   rules   │   │  folders  │   │
│   └───────────┘   └───────────┘   └───────────┘   └───────────┘   │
│                                                                     │
│   ┌───────────┐   ┌───────────────────────────────────────────┐    │
│   │ settings  │   │         files_fts (FTS5)                  │    │
│   └───────────┘   └───────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Schéma des Tables

### Table `files`

Index des fichiers connus.

```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  extension TEXT,
  size INTEGER,
  created_at TEXT,
  modified_at TEXT,
  hash TEXT,
  category TEXT,
  tags TEXT -- JSON array
);
```

### Table `history`

Historique des actions effectuées.

```sql
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL, -- 'move', 'copy', 'delete', 'organize'
  source_path TEXT,
  dest_path TEXT,
  file_name TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  reversible INTEGER DEFAULT 1,
  metadata TEXT -- JSON (extra info)
);
```

### Table `rules`

Règles de tri personnalisées.

```sql
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'extension', 'regex', 'ai'
  pattern TEXT, -- regex or extension list
  destination TEXT NOT NULL,
  priority INTEGER DEFAULT 10,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  ai_prompts TEXT -- JSON array for AI rules
);
```

### Table `folders`

Dossiers surveillés.

```sql
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active INTEGER DEFAULT 1,
  scan_frequency TEXT DEFAULT 'realtime', -- 'realtime', 'hourly', 'daily'
  last_scan TEXT,
  file_count INTEGER DEFAULT 0
);
```

### Table `settings`

Paramètres de l'application.

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT, -- JSON encoded
  updated_at TEXT
);
```

---

## 🔍 Full-Text Search (FTS5)

Pour la recherche rapide:

```sql
CREATE VIRTUAL TABLE files_fts USING fts5(
  name,
  path,
  tags,
  content=files,
  content_rowid=id
);

-- Triggers pour synchronisation
CREATE TRIGGER files_ai AFTER INSERT ON files BEGIN
  INSERT INTO files_fts(rowid, name, path, tags)
  VALUES (new.id, new.name, new.path, new.tags);
END;
```

### Recherche

```typescript
// RAGService.ts
async search(query: string): Promise<SearchResult[]> {
  return window.api.dbSearch(query)
}

// Main IPC
ipcMain.handle('db:search', async (_, query) => {
  return db.prepare(`
    SELECT f.*, snippet(files_fts, 0, '<b>', '</b>', '...', 10) as snippet
    FROM files_fts
    JOIN files f ON files_fts.rowid = f.id
    WHERE files_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `).all(query + '*')
})
```

---

## 💾 Emplacement des Données

| OS      | Chemin                                       |
| ------- | -------------------------------------------- |
| macOS   | `~/Library/Application Support/DashArchive/` |
| Windows | `%APPDATA%/DashArchive/`                     |
| Linux   | `~/.config/DashArchive/`                     |

Contenu:

```
DashArchive/
├── database.db        # Base SQLite
├── logs/              # Logs (electron-log)
└── cache/             # Cache temporaire
```

---

## 🔧 Migrations

Les migrations sont gérées dans `src/main/db/migrations.ts`:

```typescript
const MIGRATIONS = [
  {
    version: 1,
    up: `CREATE TABLE files (...)`,
    down: `DROP TABLE files`
  },
  {
    version: 2,
    up: `ALTER TABLE folders ADD COLUMN scan_frequency TEXT DEFAULT 'realtime'`,
    down: `-- Not reversible`
  }
]
```

---

## 📡 API Database

**Fichier**: `src/main/db/index.ts`

```typescript
class Database {
  // Queries
  query(sql: string, params?: any[]): any[]
  queryOne(sql: string, params?: any[]): any | null

  // Mutations
  run(sql: string, params?: any[]): { changes: number; lastInsertRowid: number }

  // Transactions
  transaction(fn: () => void): void

  // Helpers
  getFileById(id: number): FileRecord | null
  getRecentHistory(limit: number): HistoryRecord[]
  searchFiles(query: string): FileRecord[]
}
```

---

## 📈 Performances

| Opération          | Performance            |
| ------------------ | ---------------------- |
| SELECT par ID      | < 1ms                  |
| Search FTS5        | < 50ms (100k fichiers) |
| INSERT             | < 5ms                  |
| Bulk INSERT (1000) | < 500ms                |

### Optimisations

1. **Index** sur `path`, `extension`, `hash`
2. **WAL mode** pour concurrence
3. **Prepared Statements** pour les requêtes fréquentes
4. **FTS5** pour la recherche plein-texte
