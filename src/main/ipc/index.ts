/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerDialogHandlers } from './dialog'
import { registerScannerHandlers } from './scanner'
import { registerPlanHandlers } from './plan'
import { registerWatcherHandlers } from './watcher'
import { registerDatabaseHandlers } from './database'
import { registerFoldersHandlers } from './folders'

import { registerStatsHandlers } from './stats'

import { ipcMain, Notification } from 'electron'
import log from 'electron-log'
import { watcherService } from '../services/fs/watcher'
import { aiService } from '../services/ai'
import { sqlite } from '../db'
import fs from 'fs'

export function registerIpcHandlers(): void {
  registerDialogHandlers()
  registerScannerHandlers()
  registerPlanHandlers()
  registerWatcherHandlers()

  // New handler for watcher:stop, as per the provided edit snippet
  ipcMain.handle('watcher:stop', () => watcherService.stopAll())

  // Drop Zone IPC
  ipcMain.handle('DROP_ZONE:FILE_DROPPED', async (_, paths: string[]) => {
    log.info('DropZone received files:', paths)

    // Notify user - Processing started
    new Notification({
      title: 'DashArchive',
      body: `Processing ${paths.length} file(s)...`,
      silent: true
    }).show()

    try {
      // Simple sequential processing for now
      for (const filePath of paths) {
        // Check if Image (naive extension check for now, can use file-type later)
        if (/\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
          log.info(`[DropZone] Analyzing image: ${filePath}`)

          let downloadNotified = false
          const tags = await aiService.suggestTags(filePath, (data) => {
            // Check if downloading
            if (data.status === 'initiate' && !downloadNotified) {
              downloadNotified = true
              new Notification({
                title: 'DashArchive AI',
                body: 'Downloading AI Model (First Run Only)... This may take a minute.',
                silent: false
              }).show()
            }
          })

          if (tags.length > 0) {
            new Notification({
              title: 'AI Analysis Complete',
              body: `Tags: ${tags.join(', ')}`,
              silent: false
            }).show()

            // --- INDEXING FOR SEARCH ---
            // 1. Generate Embedding
            const embedding = await aiService.generateEmbedding(filePath)
            if (embedding.length > 0) {
              try {
                // Ensure file entry exists (simplistic upsert for now)
                const stats = fs.statSync(filePath)
                const name = filePath.split(/[/\\]/).pop()

                // Upsert
                sqlite
                  .prepare(
                    `
                        INSERT INTO files (id, path, name, size, category, embedding, last_scan)
                        VALUES (?, ?, ?, ?, 'image', ?, CURRENT_TIMESTAMP)
                        ON CONFLICT(id) DO UPDATE SET 
                            embedding = excluded.embedding,
                            last_scan = CURRENT_TIMESTAMP
                     `
                  )
                  .run(
                    filePath, // Using path as ID for simplicity
                    filePath,
                    name,
                    stats.size,
                    JSON.stringify(embedding)
                  )
                log.info(`[DropZone] Indexed ${name} for semantic search.`)
              } catch (dbErr) {
                log.error('Failed to save embedding:', dbErr)
              }
            }
            // ---------------------------
          } else {
            new Notification({
              title: 'AI Analysis',
              body: 'No obvious tags found.',
              silent: false
            }).show()
          }
        } else {
          new Notification({
            title: 'DashArchive',
            body: 'File received (Text/Other support coming soon).',
            silent: false
          }).show()
        }
      }
    } catch (err) {
      log.error('AI Analysis failed:', err)
      new Notification({
        title: 'DashArchive Error',
        body: 'AI Analysis failed. Check logs.',
        silent: false
      }).show()
    }

    return
  })

  // Semantic Search IPC
  ipcMain.handle('SEARCH:SEMANTIC', async (_, query: string) => {
    try {
      log.info(`[Search] Semantic query: "${query}"`)
      const queryEmbedding = await aiService.generateEmbedding(query)
      if (queryEmbedding.length === 0) return []

      // Fetch all files with embeddings
      const files = sqlite
        .prepare('SELECT id, path, name, embedding FROM files WHERE embedding IS NOT NULL')
        .all()

      if (files.length === 0) return []

      const results = files
        .map((file: any) => {
          try {
            const embedding = JSON.parse(file.embedding)
            const similarity = cosineSimilarity(queryEmbedding, embedding)
            return { ...file, score: similarity }
          } catch (e) {
            // Ignore parsing errors for now
            if (process.env.NODE_ENV === 'development') console.error(e)
            return null
          }
        })
        .filter((f: any) => f !== null)

      // Sort by score desc, take top 20
      return results.sort((a: any, b: any) => b.score - a.score).slice(0, 20)
    } catch (error) {
      log.error('Semantic search failed:', error)
      return []
    }
  })

  ipcMain.handle('shell:show-in-folder', (_, path) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('electron').shell.showItemInFolder(path)
  })

  registerDatabaseHandlers()
  registerFoldersHandlers()
  registerStatsHandlers()
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
