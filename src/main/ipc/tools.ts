import { ipcMain } from 'electron'
import { toolsService } from '../services/core/tools'

export function registerToolsHandlers(): void {
  ipcMain.handle('tools:list', async () => {
    return toolsService.getDefinitions()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('tools:execute', async (_, { name, args }: { name: string; args: any }) => {
    return toolsService.executeTool(name, args)
  })
}
