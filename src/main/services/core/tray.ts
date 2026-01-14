import { Tray, Menu, app, BrowserWindow, shell } from 'electron'
// Import asset directly for Vite handling
import icon from '../../../../resources/icon.png?asset'

export class TrayService {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null

  init(window: BrowserWindow): void {
    this.mainWindow = window
    this.createTray()
  }

  private createTray(): void {
    // Use the imported asset path
    this.tray = new Tray(icon)

    this.tray.setToolTip('DashArchive')
    this.updateContextMenu()

    this.tray.on('click', () => {
      this.toggleWindow()
    })
  }

  private updateContextMenu(): void {
    if (!this.tray) return

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'DashArchive',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open Dashboard',
        click: () => this.showWindow()
      },
      {
        label: 'Pause Watcher',
        type: 'checkbox',
        checked: false,
        click: (item) => {
          // TODO: Implement pause logic via IPC/Service
          console.log('Pause clicked', item.checked)
        }
      },
      { type: 'separator' },
      {
        label: 'Help',
        click: () => shell.openExternal('https://github.com/roketag33/DashArchive')
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }

  private toggleWindow(): void {
    if (!this.mainWindow) return
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide()
    } else {
      this.showWindow()
    }
  }

  private showWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}

export const trayService = new TrayService()
