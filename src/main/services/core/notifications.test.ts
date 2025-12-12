import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendNotification } from './notifications'
import { Notification } from 'electron'
import { getSetting } from './settings'

// Mock Settings
vi.mock('./settings', () => ({
  getSetting: vi.fn()
}))

// Mock Electron
const { NotificationMock, showMock } = vi.hoisted(() => {
  const showMock = vi.fn()
  const NotificationMock = vi.fn()
  NotificationMock.prototype.show = showMock
  // @ts-ignore - Mocking static method on spy
  NotificationMock.isSupported = vi.fn().mockReturnValue(true)
  return { NotificationMock, showMock }
})

vi.mock('electron', () => ({
  __esModule: true,
  Notification: NotificationMock
}))

describe('Notification Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Re-setup static mock since it might be reset
    // @ts-ignore - Mocking static method on spy
    NotificationMock.isSupported = vi.fn().mockReturnValue(true)
  })

  it('should create and show a notification', () => {
    // @ts-ignore - Mocking settings
    getSetting.mockReturnValue(true)

    sendNotification('Test Title', 'Test Body')

    expect(Notification).toHaveBeenCalledWith({
      title: 'Test Title',
      body: 'Test Body',
      silent: false
    })

    expect(showMock).toHaveBeenCalled()
  })

  it('should NOT show notification if disabled in settings', () => {
    // @ts-ignore - Mocking settings
    getSetting.mockReturnValue(false)

    sendNotification('Title', 'Body')

    expect(Notification).not.toHaveBeenCalled()
  })

  it('should not throw if notification fails', () => {
    // @ts-ignore - Mocking settings
    getSetting.mockReturnValue(true)

    // Make show throw
    showMock.mockImplementationOnce(() => {
      throw new Error('Notification failed')
    })

    expect(() => sendNotification('Title', 'Body')).not.toThrow()
  })
})
