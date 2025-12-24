import { BrowserWindow } from 'electron'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'

export class DropZoneWindow {
  public window: BrowserWindow

  constructor() {
    this.window = new BrowserWindow({
      width: 120,
      height: 120,
      show: false,
      frame: false, // Frameless for custom shaped window
      transparent: true, // Crucial for "Glass/Orb" look
      alwaysOnTop: true, // Must be visible above other apps
      resizable: false,
      skipTaskbar: true,
      hasShadow: false,
      // Icon only matters for Linux usually in this context
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    this.window.on('ready-to-show', () => {
      this.window.show()
    })

    // Logic for loading URL
    if (process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/dropzone`)
    }
  }

  public toggle(): void {
    if (this.window.isVisible()) {
      this.window.hide()
    } else {
      this.window.show()
    }
  }
}
