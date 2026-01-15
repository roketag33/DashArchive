import { BrowserWindow, screen, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { NotificationData } from '../../shared/types'

export class NotificationWindow {
  private window: BrowserWindow | null = null

  constructor() {
    this.createWindow()
    this.registerListeners()
  }

  private createWindow(): void {
    this.window = new BrowserWindow({
      width: 400,
      height: 300,
      show: false,
      center: false,
      frame: false,
      transparent: true,
      resizable: false,
      hasShadow: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false
      }
    })

    // Load the notification route
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      const url = `${process.env['ELECTRON_RENDERER_URL']}#/notification`
      console.log('[NotificationWindow] Loading URL:', url)
      this.window.loadURL(url)
    } else {
      const url = `file://${join(__dirname, '../renderer/index.html')}#/notification`
      console.log('[NotificationWindow] Loading file URL:', url)
      this.window.loadURL(url)
    }

    this.window.webContents.on('did-fail-load', (_, errorCode, description) => {
      console.error('[NotificationWindow] Failed to load:', errorCode, description)
    })

    // Cleanup on close
    this.window.on('closed', () => {
      this.window = null
    })
  }

  public show(data: NotificationData): void {
    console.log('[NotificationWindow] show() called with data:', data)
    if (!this.window) {
      console.log('[NotificationWindow] Window was null, creating new...')
      this.createWindow()
    }
    if (!this.window) return

    // Position at bottom right of primary display
    const { workArea } = screen.getPrimaryDisplay()
    const { width, height } = this.window.getBounds()

    // Log bounds
    console.log('[NotificationWindow] WorkArea:', workArea)

    // Bottom Right
    const x = workArea.x + workArea.width - width - 20 // 20px padding from right
    const y = workArea.y + workArea.height - height - 20 // 20px padding from bottom

    console.log('[NotificationWindow] Setting bounds:', { x, y, width, height })
    this.window.setBounds({ x, y, width, height })

    // Send data to renderer
    this.window.webContents.send('notification:data', data)

    this.window.showInactive() // Don't steal focus
    this.window.setAlwaysOnTop(true, 'screen-saver')
  }

  public hide(): void {
    if (this.window) {
      this.window.hide()
    }
  }

  public close(): void {
    if (this.window) {
      this.window.destroy()
      this.window = null
    }
  }

  private registerListeners(): void {
    ipcMain.on('notification:close', () => {
      this.hide()
    })

    ipcMain.on('notification:expand', () => {
      // Maybe open main window?
      // layout logic handled in renderer
    })
  }
}
