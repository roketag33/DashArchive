import { ipcMain, dialog, BrowserWindow } from 'electron'

export function registerDialogHandlers(): void {
  ipcMain.handle('dialog:openDirectory', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || undefined
    const { canceled, filePaths } = await dialog.showOpenDialog(win as BrowserWindow, {
      properties: ['openDirectory', 'createDirectory']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  })

  ipcMain.handle('dialog:openFile', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) || undefined
    const { canceled, filePaths } = await dialog.showOpenDialog(win as BrowserWindow, {
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
