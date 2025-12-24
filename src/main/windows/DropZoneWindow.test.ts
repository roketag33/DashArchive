import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserWindow } from 'electron'

// Mock Electron
vi.mock('electron', () => ({
  BrowserWindow: vi.fn().mockImplementation(function () {
    return {
      loadURL: vi.fn(),
      loadFile: vi.fn(),
      on: vi.fn(),
      webContents: {
        on: vi.fn(),
        setWindowOpenHandler: vi.fn()
      },
      show: vi.fn(),
      setIgnoreMouseEvents: vi.fn()
    }
  }),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn()
  },
  app: {
    isPackaged: false
  }
}))

// We can't import the class yet because it doesn't exist,
// so this test file will initially fail to compile/run,
// which is the first step of TDD (Red).
// For the sake of the tool execution, I will assume import works
// or I will define the test and then create the file.
// To make it "runnable" but failing, I'll try to import it.

import { DropZoneWindow } from './DropZoneWindow'

describe('DropZoneWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a transparent, always-on-top window', () => {
    new DropZoneWindow()

    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        webPreferences: expect.objectContaining({
          preload: expect.stringContaining('preload')
        })
      })
    )
  })
})
