import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileEntry, Plan, ExecutionResult, AppSettings, JournalEntry } from '../shared/types'

// Custom APIs for renderer
const api = {
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:openDirectory'),
  scanFolder: (path: string): Promise<FileEntry[]> => ipcRenderer.invoke('scan-folder', path),
  generatePlan: (files: FileEntry[]): Promise<Plan> => ipcRenderer.invoke('generate-plan', files),
  executePlan: (plan: Plan): Promise<ExecutionResult> => ipcRenderer.invoke('execute-plan', plan),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('save-settings', settings),
  getHistory: (): Promise<JournalEntry[]> => ipcRenderer.invoke('get-history'),
  undoPlan: (plan: Plan): Promise<ExecutionResult> => ipcRenderer.invoke('undo-plan', plan),
  suggestAiCategories: (path: string): Promise<string[]> =>
    ipcRenderer.invoke('ai-suggest-categories', path),
  markReverted: (id: string): Promise<void> => ipcRenderer.invoke('mark-reverted', id),
  deleteFiles: (paths: string[]): Promise<void> => ipcRenderer.invoke('delete-files', paths),
  findDuplicates: (files: FileEntry[]): Promise<FileEntry[][]> =>
    ipcRenderer.invoke('find-duplicates', files),
  startWatcher: (path: string): Promise<void> => ipcRenderer.invoke('watcher:start', path),
  stopWatcher: (): Promise<void> => ipcRenderer.invoke('watcher:stop'),
  onFileAdded: (callback: (path: string) => void): void => {
    ipcRenderer.on('watcher:file-added', (_, path) => callback(path))
  },
  removeFileAddedListener: (): void => {
    ipcRenderer.removeAllListeners('watcher:file-added')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
