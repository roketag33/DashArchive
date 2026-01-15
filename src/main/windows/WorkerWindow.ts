import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export class WorkerWindow {
  private window: BrowserWindow | null = null

  constructor() {
    this.createWindow()
  }

  private createWindow(): void {
    this.window = new BrowserWindow({
      show: false, // Hidden for production
      width: 100,
      height: 100,
      webPreferences: {
        preload: join(__dirname, '../../preload/index.js'),
        sandbox: false,
        webSecurity: false,
        backgroundThrottling: false, // CRITICAL: Prevent AI from sleeping when hidden
        nodeIntegration: true, // Required for Polyfill
        contextIsolation: false // Required for Polyfill
      }
    })

    this.window.on('closed', () => {
      this.window = null
    })

    // Load worker html
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/worker.html`)
    } else {
      this.window.loadFile(join(__dirname, '../../renderer/worker.html'))
    }

    // Debug
    this.window.webContents.on('did-finish-load', () => {
      console.log('[WorkerWindow] Loaded')
      // if (is.dev) this.window?.webContents.openDevTools({ mode: 'detach' })
    })
  }

  public getWebContents(): Electron.WebContents | undefined {
    return this.window?.webContents
  }
}
