import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export class SpotlightWindow {
  private window: BrowserWindow | null = null

  constructor() {
    this.createWindow()
  }

  private createWindow(): void {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      frame: false,
      transparent: true,
      center: true,
      resizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    this.window.on('ready-to-show', () => {
      // Don't show by default, wait for shortcut
    })

    this.window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/spotlight`)
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'spotlight' })
    }
  }

  public toggle(): void {
    if (!this.window) return

    if (this.window.isVisible()) {
      this.hide()
    } else {
      this.show()
    }
  }

  public show(): void {
    if (!this.window) return
    this.window.show()
    this.window.focus()
  }

  public hide(): void {
    if (!this.window) return
    this.window.hide()
  }
}
