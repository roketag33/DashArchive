import { app, shell, BrowserWindow, Notification, ipcMain } from 'electron'
import path, { join } from 'path'
import log from 'electron-log'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { watcherService } from './services/fs/watcher'
import { trayService } from './services/core/tray'
import { initDB } from './db/index'
import { migrateSettingsIfNeeded, getSettings } from './services/core/settings'
// ...
import { createMenu } from './services/core/menu'
import { globalShortcut } from 'electron'
import { DropZoneWindow } from './windows/DropZoneWindow'
import { SpotlightWindow } from './windows/SpotlightWindow'
import { WorkerWindow } from './windows/WorkerWindow'
import { NotificationWindow } from './windows/NotificationWindow'

let dropZoneWindow: DropZoneWindow | null = null
let spotlightWindow: SpotlightWindow | null = null
// Keep reference to prevent GC

let workerWindow: WorkerWindow | null = null
let notificationWindow: NotificationWindow | null = null

// Protocol Registration
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('dasharchive', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('dasharchive')
}

// Setup logger
log.transports.file.level = 'info'
log.info('App starting...')
Object.assign(console, log.functions) // Capture console.log

// Fix BigInt serialization in electron-log
// @ts-ignore - Patching JSON.stringify for BigInt support in logs
const originalStringify = JSON.stringify
JSON.stringify = function (value, replacer, space) {
  return originalStringify(
    value,
    (key, val) => {
      if (typeof val === 'bigint') {
        return val.toString() + 'n'
      }
      return typeof replacer === 'function' ? replacer(key, val) : val
    },
    space
  )
}

function createWindow(): void {
  // Determine if we should show the window (First Run) or start hidden (Tray mode)
  const settings = getSettings()
  const shouldShow = settings.firstRun

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: shouldShow, // Show if first run, otherwise hide
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: (() => {
        const p = join(__dirname, '../preload/index.js')
        console.log('Preload path:', p)
        return p
      })(),
      sandbox: false
    }
  })

  // Initialize Tray with reference to MainWindow
  trayService.init(mainWindow)

  mainWindow.on('ready-to-show', () => {
    // If we are supposed to show it (first run), ensure it's up
    if (shouldShow) {
      mainWindow.show()
    }
    // Otherwise wait for user or Tray interaction.
    watcherService.setWindow(mainWindow)
  })

  // Prevent closing, just hide
  mainWindow.on('close', (event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(app as any).isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Global flag to track explicit quit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(app as any).isQuiting = false

app.on('before-quit', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(app as any).isQuiting = true
  if (workerWindow) {
    console.log('Disposing WorkerWindow')
    workerWindow = null
  }
  trayService.destroy()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initDB()
  migrateSettingsIfNeeded()
  // Set app user model id for windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.electron')
  }

  createMenu() // Apply native menu

  // Start Scheduler
  import('./services/core/scheduler').then(({ schedulerService }) => schedulerService.init())
  // Start Learning Service
  // Start Learning Service
  import('./services/core/learning').then(({ learningService }) => {
    learningService.on('suggestion', (data) => {
      console.log('[Main] Received learning suggestion:', data)
      notificationWindow?.show(data)
    })
  })

  // Check for updates (dynamic import to avoid early app access)
  if (app.isPackaged) {
    import('electron-updater').then(({ autoUpdater }) => {
      autoUpdater.logger = log
      autoUpdater.disableWebInstaller = true
      autoUpdater.checkForUpdatesAndNotify()
    })
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    window.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' && !app.isPackaged) {
        window.webContents.toggleDevTools()
        event.preventDefault()
      }
      if (input.key === 'r' && (input.control || input.meta) && app.isPackaged) {
        event.preventDefault()
      }
    })
  })

  registerIpcHandlers()

  createWindow()

  // Initialize Drop Zone
  dropZoneWindow = new DropZoneWindow()

  // Initialize Spotlight
  spotlightWindow = new SpotlightWindow()

  // Initialize AI Worker
  workerWindow = new WorkerWindow()

  // Initialize Notification Window
  notificationWindow = new NotificationWindow()

  // Listen for show notification request from Renderer (Onboarding logic)
  ipcMain.handle('notification:show', (_, data) => {
    notificationWindow?.show(data)
  })

  // Register Global Shortcut for DropZone (Alt+Shift+D)
  globalShortcut.register('Option+Shift+D', () => {
    dropZoneWindow?.toggle()
  })

  // Register Global Shortcut for Spotlight (Cmd+Shift+Space)
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    spotlightWindow?.toggle()
  })

  // Startup Notification
  if (Notification.isSupported()) {
    const n = new Notification({
      title: 'DashArchive',
      body: 'Ghost Librarian is running in the background.',
      silent: true,
      // Icon usage might need string path in main process if not handled by bundler correctly here,
      // but 'icon' variable is imported. Leaving as is if it worked elsewhere, but standard Electron Notification
      // takes `icon` as string path usually.
      icon: process.platform === 'linux' ? icon : undefined // simplified for now to match types
    })
    n.show()
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // Respect Tray-first: Do not quit if windows are closed
  if (process.platform !== 'darwin') {
    // app.quit() // Disabled for background mode
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
