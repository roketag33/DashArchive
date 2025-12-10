import { ipcMain } from 'electron'
import { scanDirectory } from '../services/fs/scanner'
import { aiService } from '../services/analysis/aiService'
import { findDuplicates } from '../services/analysis/hashService'
import * as fs from 'fs/promises'
import * as nodePath from 'path'
import { FileEntry } from '../../shared/types'

export function registerScannerHandlers(): void {
  ipcMain.handle('scan-folder', async (_, path: string) => {
    return await scanDirectory(path)
  })

  ipcMain.handle('ai-suggest-categories', async (_, folderPath: string) => {
    try {
      // Quick scan for first 5 files
      const dir = await fs.readdir(folderPath, { withFileTypes: true })
      const files = dir
        .filter((d) => d.isFile() && !d.name.startsWith('.'))
        .map((d) => nodePath.join(folderPath, d.name))
        .slice(0, 5)

      return await aiService.suggestCategories(files)
    } catch (error) {
      console.error('Failed to suggest categories', error)
      return []
    }
  })

  ipcMain.handle('find-duplicates', async (_, files: FileEntry[]) => {
    return await findDuplicates(files)
  })
}
