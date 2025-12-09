import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import * as nodePath from 'path'
import * as fs from 'fs/promises'
import log from 'electron-log'
import { scanDirectory } from './scanner'
import { buildPlan } from '../shared/planner'
import { executePlan, undoPlan } from './executor'
import { getSettings, saveSettings } from './settings'
import { addEntry, getHistory, markReverted } from './journal'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { extractText } from './textExtractor'
import { aiService } from './aiService'
import { FileEntry } from '../shared/types'

// Setup logger
log.transports.file.level = 'info'
log.info('App starting...')
Object.assign(console, log.functions) // Capture console.log

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

import { createMenu } from './menu'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  
  createMenu() // Apply native menu

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  })

  ipcMain.handle('scan-folder', async (_, path) => {
    return await scanDirectory(path)
  })

  ipcMain.handle('ai-suggest-categories', async (_, folderPath: string) => {
    try {
      // Quick scan for first 5 files
      const dir = await fs.readdir(folderPath, { withFileTypes: true })
      const files = dir
        .filter((d) => d.isFile() && !d.name.startsWith('.'))
        .map((d) => nodePath.join(folderPath, d.name))
        .slice(0, 5)

      return await aiService.suggestCategories(files)
    } catch (error) {
      console.error('Failed to suggest categories', error)
      return []
    }
  })

  ipcMain.handle('generate-plan', async (_, files: FileEntry[]) => {
    const rules = getSettings().rules
    return await buildPlan(files, rules, extractText, (text, labels) =>
      aiService.classify(text, labels)
    )
  })

  ipcMain.handle('execute-plan', async (_, plan) => {
    const result = await executePlan(plan)
    if (result.success) {
      addEntry(plan)
    }
    return result
  })

  ipcMain.handle('get-history', () => {
    return getHistory()
  })

  ipcMain.handle('undo-plan', async (_, plan) => {
    const result = await undoPlan(plan)
    if (result.success) {
      // Find entry by plan content or pass ID?
      // For simplicity, we assume the UI passes the plan attached to the entry.
      // We probably need to mark it reverted.
      // Ideally pass entryId to undo-plan. Use plan for now.
    }
    return result
  })

  ipcMain.handle('mark-reverted', (_, id) => {
    markReverted(id)
  })

  ipcMain.handle('get-settings', () => {
    return getSettings()
  })

  ipcMain.handle('save-settings', (_, settings) => {
    return saveSettings(settings)
  })

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
