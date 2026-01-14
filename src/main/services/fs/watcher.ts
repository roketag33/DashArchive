import { subscribe, AsyncSubscription, Event } from '@parcel/watcher'
import { BrowserWindow } from 'electron'
import { EventEmitter } from 'events'

// Debounce helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

class WatcherService extends EventEmitter {
  private subscriptions: Map<string, AsyncSubscription> = new Map() // FolderID -> Subscription
  private pendingEvents: Event[] = []
  private mainWindow: BrowserWindow | null = null

  // Explicitly typing the debounced function
  private processEventsDebounced: () => void

  constructor() {
    super()
    // 500ms Buffer for high-frequency events (git checkout, npm install)
    this.processEventsDebounced = debounce(this.flushEvents.bind(this), 500)
  }

  setWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  // Legacy API support for folders.ts
  async syncWatchers(folders: { id: string; path: string; autoWatch: boolean }[]): Promise<void> {
    const activeIds = new Set<string>()

    for (const folder of folders) {
      if (folder.autoWatch) {
        activeIds.add(folder.id)
        if (!this.subscriptions.has(folder.id)) {
          // New folder to watch
          await this.watchFolder(folder.id, folder.path)
        }
      } else {
        // Should not be watched
        if (this.subscriptions.has(folder.id)) {
          await this.unwatchFolder(folder.id)
        }
      }
    }

    // systems cleanup
    for (const id of this.subscriptions.keys()) {
      if (!activeIds.has(id)) {
        await this.unwatchFolder(id)
      }
    }
  }

  async watchFolder(id: string, dirPath: string): Promise<void> {
    if (this.subscriptions.has(id)) {
      await this.unwatchFolder(id)
    }

    console.log(`[Watcher] Starting Native Watcher on: ${dirPath} (ID: ${id})`)

    try {
      const sub = await subscribe(
        dirPath,
        (err, events) => {
          if (err) {
            console.error('[Watcher] Error:', err)
            this.emit('error', err)
            return
          }

          // Buffer events
          this.pendingEvents.push(...events)
          this.processEventsDebounced()
        },
        {
          // Ignore common artifacts to reduce noise
          ignore: ['**/.git/**', '**/node_modules/**', '**/.DS_Store', '**/Thumbs.db']
        }
      )

      this.subscriptions.set(id, sub)
      console.log(`[Watcher] Subscription active for ${id}`)
    } catch (error) {
      console.error(`[Watcher] Failed to start watching ${id}:`, error)
      // Don't throw to prevent crashing the loop, just log
    }
  }

  async unwatchFolder(id: string): Promise<void> {
    const sub = this.subscriptions.get(id)
    if (sub) {
      await sub.unsubscribe()
      this.subscriptions.delete(id)
      console.log(`[Watcher] Stopped watching ${id}`)
    }
  }

  // Alias for single-path usage (backward compat if needed)
  async startWatching(dirPath: string): Promise<void> {
    // Use a generic ID
    await this.watchFolder('root', dirPath)
  }

  async stopWatching(): Promise<void> {
    await this.unwatchFolder('root')
  }

  async stopAll(): Promise<void> {
    for (const id of this.subscriptions.keys()) {
      await this.unwatchFolder(id)
    }
  }

  private flushEvents(): void {
    if (this.pendingEvents.length === 0) return

    const eventsToProcess = [...this.pendingEvents]
    this.pendingEvents = [] // Clear buffer

    // Emit batch for Main Process consumption (DB)
    console.log(`[Watcher] Flushing ${eventsToProcess.length} events`)
    this.emit('batch', eventsToProcess)

    // If Window is open, send Delta update to UI
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      // Map native events to UI format if needed, or send raw
      // UI expects 'watcher:file-added' usually one by one in legacy, but we prefer batch
      // For legacy compat, we might iterate. For V1 New UI, we send batch.
      this.mainWindow.webContents.send('watcher:events', eventsToProcess)
    }
  }
}

export const watcherService = new WatcherService()
