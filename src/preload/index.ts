import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../shared/types'

// Custom APIs for renderer
const api = {
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:openDirectory'),
  scanFolder: (pathOrId: string | { path?: string; id?: string }): Promise<FileEntry[]> => {
    // Support legacy string or new object signature
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arg = (typeof pathOrId === 'string' ? { path: pathOrId } : pathOrId) as any
    return ipcRenderer.invoke('scan-folder', arg)
  },
  generatePlan: (files: FileEntry[]): Promise<Plan> => ipcRenderer.invoke('generate-plan', files),
  executePlan: (plan: Plan): Promise<ExecutionResult> => ipcRenderer.invoke('execute-plan', plan),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  getRules: (): Promise<import('../shared/types').Rule[]> =>
    ipcRenderer.invoke('get-settings').then((s) => s.rules), // Helper
  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('save-settings', settings),
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

  // Folders API
  getFolders: () => ipcRenderer.invoke('folders:get-all'),
  addFolder: (folder) => ipcRenderer.invoke('folders:add', folder),
  updateFolder: (id, updates) => ipcRenderer.invoke('folders:update', { id, updates }),
  deleteFolder: (id) => ipcRenderer.invoke('folders:delete', id),
  getFolderRules: (folderId) => ipcRenderer.invoke('folders:get-rules', folderId),
  setFolderRules: (folderId, ruleIds) =>
    ipcRenderer.invoke('folders:set-rules', { folderId, ruleIds }),

  // Stats API
  getStats: () => ipcRenderer.invoke('stats:get')
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
