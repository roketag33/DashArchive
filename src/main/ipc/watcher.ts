import { ipcMain } from 'electron'
import { watcherService } from '../services/fs/watcher'

export function registerWatcherHandlers(): void {
  ipcMain.handle('watcher:start', (_, path: string) => {
    // Deprecated for direct usage, but can be mapped to a temporary folder watch
    const tempId = 'temp-' + Date.now();
    watcherService.watchFolder(tempId, path);
  })

  ipcMain.handle('watcher:stop', () => {
    watcherService.stopAll()
  })
}
