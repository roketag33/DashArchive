import { ElectronAPI } from '@electron-toolkit/preload'
import { FileEntry } from '../shared/types'

interface CustomAPI {
  selectFolder: () => Promise<string | null>
  scanFolder: (path: string) => Promise<FileEntry[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
