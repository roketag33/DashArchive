// src/main/watcher.ts
import { watch, FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'

class WatcherService {
  private watchers: Map<string, FSWatcher> = new Map() // ID -> Watcher
  private mainWindow: BrowserWindow | null = null

  setWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  // Watch a specific folder
  watchFolder(id: string, path: string): void {
    if (this.watchers.has(id)) {
      this.unwatchFolder(id)
    }

    console.log(`[Watcher] Starting watch on folder ${id}: ${path}`)

    const watcher = watch(path, {
      ignored: /(^|[/\\])\../,
      persistent: true,
      ignoreInitial: true,
      depth: 0 
    })

    watcher.on('add', (filePath) => {
      console.log(`[Watcher] File added in ${path}: ${filePath}`)
      if (this.mainWindow) {
        // Send file path AND folderId so we know where it came from
        this.mainWindow.webContents.send('watcher:file-added', { folderId: id, filePath })
      }
    })

    this.watchers.set(id, watcher)
  }

  unwatchFolder(id: string): void {
    const watcher = this.watchers.get(id)
    if (watcher) {
        console.log(`[Watcher] Stopping watch on folder ${id}`)
        watcher.close()
        this.watchers.delete(id)
    }
  }

  // Sync watchers with active DB folders
  syncWatchers(folders: { id: string, path: string, autoWatch: boolean }[]): void {
      const activeIds = new Set<string>();

      for (const folder of folders) {
          if (folder.autoWatch) {
              activeIds.add(folder.id);
              if (!this.watchers.has(folder.id)) {
                  this.watchFolder(folder.id, folder.path);
              }
          } else {
              // If it exists but shouldn't watch, remove it
              if (this.watchers.has(folder.id)) {
                  this.unwatchFolder(folder.id);
              }
          }
      }

      // Remove watchers for folders that no longer exist
      for (const id of this.watchers.keys()) {
          if (!activeIds.has(id)) {
              this.unwatchFolder(id);
          }
      }
  }

  stopAll(): void {
    for (const watcher of this.watchers.values()) {
        watcher.close()
    }
    this.watchers.clear()
  }
}

export const watcherService = new WatcherService()
