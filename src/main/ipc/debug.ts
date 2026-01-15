import { ipcMain, app } from 'electron'
import path from 'path'
import { stressTestService } from '../services/testing/stress-test'

export function registerDebugHandlers(): void {
  ipcMain.handle('debug:stress-test', async () => {
    const desktop = app.getPath('desktop')
    const inputDir = path.join(desktop, 'GhostStressTest')
    const reportPath = path.join(desktop, 'ghost_report.csv')

    console.log('[Debug] Starting Stress Test...')
    try {
      await stressTestService.runLegacyScan(inputDir, reportPath)
      return { success: true, reportPath }
    } catch (e) {
      console.error(e)
      return { success: false, error: String(e) }
    }
  })
}
