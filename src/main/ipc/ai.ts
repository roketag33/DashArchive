import { ipcMain, BrowserWindow } from 'electron'

export function registerAIHandlers(): void {
  // Route 'ai:ask' from UI to Worker
  ipcMain.on('ai:ask', (event, payload) => {
    const worker = BrowserWindow.getAllWindows().find((w) =>
      w.webContents.getURL().includes('worker.html')
    )
    if (worker) {
      worker.webContents.send('ai:ask', payload)
    } else {
      console.error('[IPC] AI Worker not found')
      event.reply('ai:response', { id: payload.id, error: 'AI Service Unavailable' })
    }
  })

  // Route 'ai:response' from Worker to UI
  ipcMain.on('ai:response', (_, payload) => {
    // Broadcast to all windows (or target specific if we tracked sender)
    // For now, broadcasting to main window is sufficient
    // We filter by ID in the UI anyway
    BrowserWindow.getAllWindows().forEach((w) => {
      if (!w.webContents.getURL().includes('worker.html')) {
        w.webContents.send('ai:response', payload)
      }
    })
  })

  // Progress updates
  ipcMain.on('ai:progress', (_, payload) => {
    // console.log('[AI Main] Progress:', typeof payload === 'object' ? payload.progress : payload)
    BrowserWindow.getAllWindows().forEach((w) => {
      if (!w.webContents.getURL().includes('worker.html')) {
        w.webContents.send('ai:progress', payload)
      }
    })
  })

  // Ready state
  ipcMain.on('ai:ready', () => {
    console.log('[AI Main] Service Ready')
    BrowserWindow.getAllWindows().forEach((w) => {
      if (!w.webContents.getURL().includes('worker.html')) {
        w.webContents.send('ai:ready')
      }
    })
  })

  // Error state
  ipcMain.on('ai:error', (_, error) => {
    console.error('[AI Main] Service Error:', error)
    BrowserWindow.getAllWindows().forEach((w) => {
      if (!w.webContents.getURL().includes('worker.html')) {
        w.webContents.send('ai:error', error)
      }
    })
  })
}
