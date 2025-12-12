import { registerDialogHandlers } from './dialog'
import { registerScannerHandlers } from './scanner'
import { registerPlanHandlers } from './plan'
import { registerWatcherHandlers } from './watcher'
import { registerDatabaseHandlers } from './database'
import { registerFoldersHandlers } from './folders'

export function registerIpcHandlers(): void {
  registerDialogHandlers()
  registerScannerHandlers()
  registerPlanHandlers()
  registerWatcherHandlers()
  registerDatabaseHandlers()
  registerFoldersHandlers()
}
