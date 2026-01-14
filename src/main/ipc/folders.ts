import { ipcMain, app } from 'electron'
import {
  getFolders,
  addFolder,
  updateFolder,
  deleteFolder,
  getFolderRules,
  setFolderRules,
  Folder
} from '../db/folders'
import { watcherService } from '../services/fs/watcher'

export function registerFoldersHandlers(): void {
  ipcMain.handle('folders:get-all', () => {
    return getFolders()
  })

  ipcMain.handle('folders:get-system-paths', () => {
    return {
      downloads: app.getPath('downloads'),
      desktop: app.getPath('desktop'),
      documents: app.getPath('documents'),
      pictures: app.getPath('pictures'),
      music: app.getPath('music'),
      videos: app.getPath('videos')
    }
  })

  ipcMain.handle('folders:add', (_, folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Generate ID here or in DB service? DB Service usually takes ID if it's UUID,
    // but better-sqlite3 doesn't auto-gen UUIDs. Let's gen here.
    const id = Math.random().toString(36).substring(2, 15)
    const newFolder = addFolder({ ...folder, id })

    // Refresh watcher
    refreshWatchers()

    return newFolder
  })

  ipcMain.handle(
    'folders:update',
    (_, { id, updates }: { id: string; updates: Partial<Folder> }) => {
      updateFolder(id, updates)
      refreshWatchers()
    }
  )

  ipcMain.handle('folders:delete', (_, id: string) => {
    deleteFolder(id)
    refreshWatchers()
  })

  ipcMain.handle('folders:get-rules', async (_, folderId: string): Promise<string[]> => {
    try {
      const rules = await getFolderRules(folderId)
      return rules
    } catch (error) {
      console.error('Failed to get folder rules:', error)
      throw error
    }
  })

  ipcMain.handle(
    'folders:set-rules',
    (_, { folderId, ruleIds }: { folderId: string; ruleIds: string[] }): void => {
      setFolderRules(folderId, ruleIds)
    }
  )
}

import { schedulerService } from '../services/core/scheduler'

function refreshWatchers(): void {
  const folders = getFolders()
  watcherService.syncWatchers(folders)
  schedulerService.refreshSchedules()
}
