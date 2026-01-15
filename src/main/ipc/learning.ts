import { ipcMain } from 'electron'
import { learningService } from '../services/core/learning'

export function registerLearningHandlers(): void {
  ipcMain.handle('learning:analyze-folder', async (_, folderPath: string) => {
    return learningService.scanHierarchy(folderPath)
  })
}
