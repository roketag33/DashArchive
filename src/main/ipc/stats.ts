import { ipcMain } from 'electron'
import { getStats } from '../services/core/stats'

export function registerStatsHandlers(): void {
  ipcMain.handle('stats:get', async () => {
    return await getStats()
  })
}
