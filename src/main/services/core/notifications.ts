import { Notification } from 'electron'
import { getSetting } from './settings'

export function sendNotification(title: string, body: string): void {
  // console.log('Notification supported:', Notification.isSupported ? Notification.isSupported() : 'undefined')
  // console.log('Notification mock:', Notification)
  if (!Notification.isSupported()) return

  // Check settings (default to true if not set)
  const enabled = getSetting<boolean>('notifications.enabled', true)
  if (enabled === false) return

  try {
    new Notification({
      title,
      body,
      silent: false
    }).show()
  } catch (e) {
    console.error('Failed to send notification', e)
  }
}
