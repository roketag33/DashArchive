import { registerDialogHandlers } from './dialog'
import { registerScannerHandlers } from './scanner'
import { registerPlanHandlers } from './plan'
import { registerWatcherHandlers } from './watcher'
import { registerSettingsHandlers } from './settings'

export function registerIpcHandlers(): void {
  registerDialogHandlers()
  registerScannerHandlers()
  registerPlanHandlers()
  registerWatcherHandlers()
  registerSettingsHandlers()
}
