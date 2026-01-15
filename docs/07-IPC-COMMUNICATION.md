# DashArchive - Communication IPC

## 📡 Vue d'Ensemble

L'IPC (Inter-Process Communication) est le canal de communication entre les processus Electron.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COMMUNICATION IPC                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   RENDERER                    PRELOAD                    MAIN       │
│  ┌─────────┐               ┌─────────┐               ┌─────────┐   │
│  │ React   │──window.api──►│ Bridge  │──ipcRenderer──►│ Handler │   │
│  │ App     │◄──callback────│ (safe)  │◄──ipcMain─────│ (Node)  │   │
│  └─────────┘               └─────────┘               └─────────┘   │
│                                                                     │
│   WORKER                                                            │
│  ┌─────────┐               ┌─────────┐               ┌─────────┐   │
│  │ AI      │──window.api──►│ Preload │──ipcRenderer──►│ Main    │   │
│  │ (LLM)   │◄──callback────│ Bridge  │◄──webContents─│ Router  │   │
│  └─────────┘               └─────────┘               └─────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Preload Bridge

**Fichier**: `src/preload/index.ts`

Le preload expose des APIs sécurisées via `contextBridge`:

```typescript
contextBridge.exposeInMainWorld('api', {
  // Files
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),

  // AI
  ai: {
    ask: (id, prompt) => ipcRenderer.send('ai:ask', { id, prompt }),
    onResponse: (callback) => {
      ipcRenderer.on('ai:response', (_, payload) => callback(payload))
      return () => ipcRenderer.removeListener('ai:response', handler)
    }
  },

  // Tools
  listTools: () => ipcRenderer.invoke('tools:list'),
  executeTool: (name, args) => ipcRenderer.invoke('tools:execute', { name, args })
})
```

---

## 📨 Canaux IPC

### Canaux AI

| Canal         | Direction                | Description               |
| ------------- | ------------------------ | ------------------------- |
| `ai:ask`      | Renderer → Main          | Envoie une question       |
| `ai:response` | Main → Renderer          | Réponse de l'IA           |
| `ai:progress` | Worker → Main → Renderer | Progression du chargement |
| `ai:ready`    | Worker → Main → Renderer | IA prête                  |
| `ai:error`    | Worker → Main → Renderer | Erreur                    |

### Canaux Tools

| Canal           | Direction       | Description      |
| --------------- | --------------- | ---------------- |
| `tools:list`    | Renderer → Main | Liste les outils |
| `tools:execute` | Renderer → Main | Exécute un outil |

### Canaux Files

| Canal           | Direction       | Description           |
| --------------- | --------------- | --------------------- |
| `files:process` | Renderer → Main | Traite un fichier     |
| `files:history` | Renderer → Main | Récupère l'historique |
| `files:undo`    | Renderer → Main | Annule une action     |

### Canaux Settings

| Canal          | Direction       | Description             |
| -------------- | --------------- | ----------------------- |
| `settings:get` | Renderer → Main | Récupère les paramètres |
| `settings:set` | Renderer → Main | Modifie les paramètres  |

### Canaux Folders

| Canal            | Direction       | Description                   |
| ---------------- | --------------- | ----------------------------- |
| `folders:list`   | Renderer → Main | Liste les dossiers surveillés |
| `folders:add`    | Renderer → Main | Ajoute un dossier             |
| `folders:remove` | Renderer → Main | Retire un dossier             |
| `folders:scan`   | Renderer → Main | Scanne un dossier             |

---

## 🔄 Patterns de Communication

### Invoke (Request-Response)

```typescript
// Renderer
const result = await window.api.listTools()

// Main
ipcMain.handle('tools:list', async () => {
  return toolsService.getDefinitions()
})
```

### Send/On (Fire-and-Forget)

```typescript
// Renderer
window.api.ai.ask(id, prompt)

// Main
ipcMain.on('ai:ask', async (event, { id, prompt }) => {
  // Process...
  event.sender.send('ai:response', { id, content })
})
```

### Avec Cleanup (Listener)

```typescript
// Renderer (useEffect)
useEffect(() => {
  const unsubscribe = window.api.ai.onResponse((payload) => {
    // Handle response
  })
  return () => unsubscribe() // Cleanup
}, [])
```

---

## 📁 Structure des IPC Handlers

```
src/main/ipc/
├── ai.ts            # AI handlers (ask, response)
├── debug.ts         # Debugging
├── files.ts         # File operations
├── folders.ts       # Folder management
├── history.ts       # History queries
├── learning.ts      # Learning service
├── rules.ts         # Rule management
├── settings.ts      # Settings
└── tools.ts         # Agentic tools
```

---

## ⚡ Worker Window IPC

Le Worker AI a son propre bridge:

```typescript
// Preload exposes aiWorker
aiWorker: {
  sendProgress: (data) => ipcRenderer.send('ai:progress', data),
  sendReady: () => ipcRenderer.send('ai:ready'),
  sendError: (msg) => ipcRenderer.send('ai:error', msg),
  sendResponse: (data) => ipcRenderer.send('ai:response', data),
  onAsk: (callback) => ipcRenderer.on('ai:ask', (_, payload) => callback(payload))
}
```

### Flow Complet

```
[User types in Chat]
       │
       ▼
[Renderer] window.api.ai.ask(id, prompt)
       │
       ▼
[Main] ipcMain.on('ai:ask')
       │
       ▼
[Main] workerWindow.webContents.send('ai:ask', { id, prompt })
       │
       ▼
[Worker] window.api.aiWorker.onAsk(callback)
       │
       ▼
[Worker] LLM generates response
       │
       ▼
[Worker] window.api.aiWorker.sendResponse({ id, content, toolCall? })
       │
       ▼
[Main] ipcMain.on('ai:response') → mainWindow.send('ai:response')
       │
       ▼
[Renderer] window.api.ai.onResponse(callback) → Updates UI
```

---

## 🔒 Sécurité IPC

1. **Context Isolation**: Activé par défaut
2. **Whitelist**: Seules les APIs exposées sont accessibles
3. **Validation**: Les inputs sont validés côté Main
4. **Pas de nodeIntegration**: Désactivé côté Renderer
