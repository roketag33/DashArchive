import { ipcMain } from 'electron'
import { watcherService } from '../services/fs/watcher'

export function registerWatcherHandlers(): void {
  ipcMain.handle('watcher:start', (_, path: string) => {
    watcherService.start(path)
  })

  ipcMain.handle('watcher:stop', () => {
    watcherService.stop()
  })
}
