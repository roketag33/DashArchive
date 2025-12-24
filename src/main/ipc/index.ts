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
import { aiService } from '../services/ai'

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

    // Notify user - Processing started
    new Notification({
      title: 'DashArchive',
      body: `Processing ${paths.length} file(s)...`,
      silent: true
    }).show()

    try {
      // Simple sequential processing for now
      for (const filePath of paths) {
        // Check if Image (naive extension check for now, can use file-type later)
        if (/\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
          log.info(`[DropZone] Analyzing image: ${filePath}`)
          const tags = await aiService.suggestTags(filePath)

          if (tags.length > 0) {
            new Notification({
              title: 'AI Analysis Complete',
              body: `Tags: ${tags.join(', ')}`,
              silent: false
            }).show()
          } else {
            new Notification({
              title: 'AI Analysis',
              body: 'No obvious tags found.',
              silent: false
            }).show()
          }
        } else {
          new Notification({
            title: 'DashArchive',
            body: 'File received (Text/Other support coming soon).',
            silent: false
          }).show()
        }
      }
    } catch (err) {
      log.error('AI Analysis failed:', err)
      new Notification({
        title: 'DashArchive Error',
        body: 'AI Analysis failed. Check logs.',
        silent: false
      }).show()
    }

    return
  })

  registerDatabaseHandlers()
  registerFoldersHandlers()
  registerStatsHandlers()
}
