import { registerDialogHandlers } from './dialog'
import { registerScannerHandlers } from './scanner'
import { registerPlanHandlers } from './plan'
import { registerWatcherHandlers } from './watcher'
import { registerDatabaseHandlers } from './database'
import { registerFoldersHandlers } from './folders'

import { registerStatsHandlers } from './stats'

import { ipcMain, Notification } from 'electron'
import log from 'electron-log'
import { watcherService } from '../services/fs/watcher'

export function registerIpcHandlers(): void {
  registerDialogHandlers()
  registerScannerHandlers()
  registerPlanHandlers()
  registerWatcherHandlers()

  // New handler for watcher:stop, as per the provided edit snippet
  ipcMain.handle('watcher:stop', () => watcherService.stopAll())

  // Drop Zone IPC
  ipcMain.handle('DROP_ZONE:FILE_DROPPED', async (_, paths: string[]) => {
    log.info('DropZone received files:', paths)

    // Notify user

    new Notification({
      title: 'DashArchive',
      body: `Received ${paths.length} file(s). Analysis started.`,
      silent: false
    }).show()

    // Future: Trigger analysis flow
    return
  })

  registerDatabaseHandlers()
  registerFoldersHandlers()
  registerStatsHandlers()
}
