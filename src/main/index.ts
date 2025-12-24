import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import log from 'electron-log'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { watcherService } from './services/fs/watcher'
import { initDB } from './db/index'
import { migrateSettingsIfNeeded } from './services/core/settings'
// ...
import { createMenu } from './services/core/menu'

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
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    watcherService.setWindow(mainWindow)
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

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  registerIpcHandlers()

  createWindow()

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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
