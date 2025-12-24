import { registerDialogHandlers } from './dialog'
import { registerScannerHandlers } from './scanner'
import { registerPlanHandlers } from './plan'
import { registerWatcherHandlers } from './watcher'
import { registerDatabaseHandlers } from './database'
import { registerFoldersHandlers } from './folders'

import { registerStatsHandlers } from './stats'

import { ipcMain } from 'electron'
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
    // We can reuse the planner or tagger service here
    // For now, let's just log and maybe notify the watcher or run the plan directly
    // Ideally, we treat this as "manual trigger" for specific files
    log.info('DropZone received files:', paths)

    // TODO: Trigger processing flow
    // 1. Scan/Analyze files
    // 2. Generate Plan
    // 3. Execute or Ask for confirmation

    return
  })

  registerDatabaseHandlers()
  registerFoldersHandlers()
  registerStatsHandlers()
}
