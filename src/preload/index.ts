import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../shared/types'

// Custom APIs for renderer
const api = {
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:openDirectory'),
  openFile: (): Promise<string[]> => ipcRenderer.invoke('dialog:openFile'),
  scanFolder: (pathOrId: string | { path?: string; id?: string }): Promise<FileEntry[]> => {
    // Support legacy string or new object signature
    const arg = (typeof pathOrId === 'string' ? { path: pathOrId } : pathOrId) as unknown as {
      path?: string
      id?: string
    }
    return ipcRenderer.invoke('scan-folder', arg)
  },
  generatePlan: (files: FileEntry[]): Promise<Plan> => ipcRenderer.invoke('generate-plan', files),
  executePlan: (plan: Plan): Promise<ExecutionResult> => ipcRenderer.invoke('execute-plan', plan),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  getRules: (): Promise<import('../shared/types').Rule[]> =>
    ipcRenderer.invoke('get-settings').then((s) => s.rules), // Helper
  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('save-settings', settings),
  savePresets: (blockIds: string[]): Promise<void> =>
    ipcRenderer.invoke('settings:save-presets', blockIds),
  resetRules: (): Promise<AppSettings> => ipcRenderer.invoke('settings:reset-rules'),
  getHistory: (): Promise<JournalEntry[]> => ipcRenderer.invoke('get-history'),
  undoPlan: (plan: Plan, entryId?: string): Promise<ExecutionResult> =>
    ipcRenderer.invoke('undo-plan', { plan, entryId }),
  suggestAiCategories: (path: string): Promise<string[]> =>
    ipcRenderer.invoke('ai-suggest-categories', path),
  markReverted: (id: string): Promise<void> => ipcRenderer.invoke('mark-reverted', id),
  deleteFiles: (paths: string[]): Promise<void> => ipcRenderer.invoke('delete-files', paths),
  findDuplicates: (files: FileEntry[]): Promise<FileEntry[][]> =>
    ipcRenderer.invoke('find-duplicates', files),
  startWatcher: (path: string): Promise<void> => ipcRenderer.invoke('watcher:start', path),
  stopWatcher: (): Promise<void> => ipcRenderer.invoke('watcher:stop'),
  onFileAdded: (callback: (path: string) => void): void => {
    ipcRenderer.on('watcher:file-added', (_, payload) => {
      // Support legacy string or new object
      const path = typeof payload === 'string' ? payload : payload.filePath
      callback(path) // TODO: pass folderId too if needed by UI
    })
  },
  removeFileAddedListener: (): void => {
    ipcRenderer.removeAllListeners('watcher:file-added')
  },
  processDroppedFiles: (paths: string[]): Promise<void> =>
    ipcRenderer.invoke('DROP_ZONE:FILE_DROPPED', paths),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchSemantic: (query: string): Promise<any[]> => ipcRenderer.invoke('SEARCH:SEMANTIC', query),

  universalScan: (directories: string[]): Promise<import('../shared/types').UniversalScanResult> =>
    ipcRenderer.invoke('universal:scan', directories),

  universalApply: (
    result: import('../shared/types').UniversalScanResult
  ): Promise<import('../shared/types').ExecutionResult> =>
    ipcRenderer.invoke('universal:apply', result),

  showNotification: (data: import('../shared/types').UniversalScanResult) =>
    ipcRenderer.invoke('notification:show', data),
  onNotificationData: (callback: (data: import('../shared/types').UniversalScanResult) => void) => {
    const handler = (
      _: Electron.IpcRendererEvent,
      data: import('../shared/types').UniversalScanResult
    ): void => callback(data)
    ipcRenderer.on('notification:data', handler)
    return () => ipcRenderer.removeListener('notification:data', handler)
  },
  closeNotification: () => ipcRenderer.send('notification:close'),

  // Explicit Context API
  readFiles: (paths: string[]): Promise<{ path: string; name: string; content: string }[]> =>
    ipcRenderer.invoke('fs:read-files', paths),

  // Folders API
  getFolders: () => ipcRenderer.invoke('folders:get-all'),
  addFolder: (folder) => ipcRenderer.invoke('folders:add', folder),
  updateFolder: (id, updates) => ipcRenderer.invoke('folders:update', { id, updates }),
  deleteFolder: (id) => ipcRenderer.invoke('folders:delete', id),
  getFolderRules: (folderId) => ipcRenderer.invoke('folders:get-rules', folderId),
  setFolderRules: (folderId, ruleIds) =>
    ipcRenderer.invoke('folders:set-rules', { folderId, ruleIds }),
  getSystemPaths: () => ipcRenderer.invoke('folders:get-system-paths'),

  // Stats API
  getStats: () => ipcRenderer.invoke('stats:get'),
  showInFolder: (path: string) => ipcRenderer.invoke('shell:show-in-folder', path),

  // Vault API
  vault: {
    unlock: (password: string) => ipcRenderer.invoke('vault:unlock', password),
    lock: () => ipcRenderer.invoke('vault:lock'),
    getStatus: () => ipcRenderer.invoke('vault:status'),
    encryptFile: (source: string, dest: string) =>
      ipcRenderer.invoke('vault:encrypt-file', { source, dest }),
    decryptFile: (source: string, dest: string) =>
      ipcRenderer.invoke('vault:decrypt-file', { source, dest })
  },

  // AI Worker API
  ai: {
    ask: (id: string, prompt: string) => ipcRenderer.send('ai:ask', { id, prompt }),
    onResponse: (
      callback: (response: { id: string; content?: string; error?: string }) => void
    ): (() => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (_: any, payload: any): void => callback(payload)
      ipcRenderer.on('ai:response', handler)
      return (): void => {
        ipcRenderer.removeListener('ai:response', handler)
      }
    },
    onProgress: (callback: (progress: unknown) => void) => {
      ipcRenderer.on('ai:progress', (_, payload) => callback(payload))
    },
    onReady: (callback: () => void) => {
      ipcRenderer.on('ai:ready', () => callback())
    },
    onError: (callback: (error: string) => void) => {
      ipcRenderer.on('ai:error', (_, error) => callback(error))
    }
  },
  // Dedicated Worker API (Sending side)
  aiWorker: {
    sendProgress: (data: unknown) => ipcRenderer.send('ai:progress', data),
    sendReady: () => ipcRenderer.send('ai:ready'),
    sendError: (msg: string) => ipcRenderer.send('ai:error', msg),
    sendResponse: (data: unknown) => ipcRenderer.send('ai:response', data),
    onAsk: (callback: (payload: { id: string; prompt: string }) => void) => {
      ipcRenderer.on('ai:ask', (_, payload) => callback(payload))
    }
  },
  approveLearning: (data: { extension: string; targetFolder: string }) =>
    ipcRenderer.invoke('learning:approve', data),
  runStressTest: () => ipcRenderer.invoke('debug:stress-test'),

  // Learning API
  analyzeFolder: (path: string) => ipcRenderer.invoke('learning:analyze-folder', path),

  // Tools API
  listTools: () => ipcRenderer.invoke('tools:list'),
  executeTool: (name, args) => ipcRenderer.invoke('tools:execute', { name, args })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error('Failed to expose electronAPI:', error)
  }

  try {
    contextBridge.exposeInMainWorld('api', api)
    console.log('Preload: api exposed successfully')
  } catch (error) {
    console.error('Failed to expose api:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  console.log('Preload: Context isolation disabled, APIs attached to window')
}
