import { Notification, BrowserWindow } from 'electron'
import { EventEmitter } from 'events'
import icon from '../../../../resources/icon.png?asset'

export interface NotificationAction {
  type: 'button'
  text: string
}

export interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
  action?: string // Legacy URL or IPC action
  actions?: NotificationAction[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any
}

export class NotificationService extends EventEmitter {
  public send(options: NotificationOptions): void {
    if (!Notification.isSupported()) return

    const n = new Notification({
      title: options.title || 'DashArchive',
      body: options.body,
      silent: options.silent || false,
      icon: process.platform === 'linux' ? icon : undefined,
      actions: options.actions
    })

    // Handle body click (Legacy "action" prop)
    if (options.action) {
      n.on('click', () => {
        this.handleLegacyAction(options.action!)
      })
    }

    // Handle Action Buttons
    if (options.actions) {
      n.on('action', (_, index) => {
        this.emit('action', { index, payload: options.payload })
      })
    }

    n.show()
  }

  private handleLegacyAction(action: string): void {
    console.log('[NotificationService] Action triggered:', action)

    // Bring app to front
    const win = BrowserWindow.getAllWindows().find(
      (w) => !w.webContents.getURL().includes('worker.html')
    )
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
      win.webContents.send('notification:action', action)
    }
  }
}

export const notificationService = new NotificationService()
