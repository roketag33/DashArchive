import { ipcMain, dialog } from 'electron'

export function registerDialogHandlers(): void {
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  })

  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Documents', extensions: ['pdf', 'txt', 'md', 'jpg', 'png', 'webp'] }]
    })
    if (canceled) {
      return []
    } else {
      return filePaths
    }
  })
}
