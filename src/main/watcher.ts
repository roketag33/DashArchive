// src/main/watcher.ts
import { watch, FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'

class WatcherService {
  private watcher: FSWatcher | null = null
  private mainWindow: BrowserWindow | null = null

  setWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  start(folderPath: string): void {
    this.stop() // Stop existing if any

    console.log(`[Watcher] Starting watch on: ${folderPath}`)

    this.watcher = watch(folderPath, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // Don't fire for initial files
      depth: 0 // Only top level? Or recursive? Let's do top level for now to mimic simple scanner
    })

    this.watcher.on('add', (path) => {
      console.log(`[Watcher] File added: ${path}`)
      if (this.mainWindow) {
        this.mainWindow.webContents.send('watcher:file-added', path)
      }
    })
  }

  stop(): void {
    if (this.watcher) {
      console.log('[Watcher] Stopping...')
      this.watcher.close()
      this.watcher = null
    }
  }
}

export const watcherService = new WatcherService()
