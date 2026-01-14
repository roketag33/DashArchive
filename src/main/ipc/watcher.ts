import { ipcMain } from 'electron'
import { watcherService } from '../services/fs/watcher'

export function registerWatcherHandlers(): void {
  ipcMain.handle('watcher:start', async (_, path: string) => {
    // New API uses startWatching(path)
    await watcherService.startWatching(path)
  })

  ipcMain.handle('watcher:stop', async () => {
    await watcherService.stopWatching()
  })
}
