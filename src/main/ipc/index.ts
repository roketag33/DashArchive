/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerDialogHandlers } from './dialog'
import { registerScannerHandlers } from './scanner'
import { registerPlanHandlers } from './plan'
import { registerWatcherHandlers } from './watcher'
import { registerDatabaseHandlers } from './database'
import { registerFoldersHandlers } from './folders'
import { registerAIHandlers } from './ai'
import { registerSettingsHandlers } from './settings'
import { registerUniversalHandlers } from './universal'
import { registerLearningHandlers } from './learning'
import { registerToolsHandlers } from './tools'

import { registerStatsHandlers } from './stats'

import { ipcMain, Notification } from 'electron'
import log from 'electron-log'
import { aiService } from '../services/ai'
import { sqlite } from '../db'
import fs from 'fs'

import { registerVaultHandlers } from './vault'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as pdfLib from 'pdf-parse'

export function registerIpcHandlers(): void {
  registerDialogHandlers()
  registerScannerHandlers()
  registerPlanHandlers()
  registerSettingsHandlers()
  registerWatcherHandlers()
  registerVaultHandlers() // Register Vault Handlers
  registerAIHandlers()
  registerUniversalHandlers()
  registerLearningHandlers()
  registerToolsHandlers()

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
        // Handle Images
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
          new Notification({
            title: 'DashArchive',
            body: 'File received (Text/Other support coming soon).',
            silent: false
          }).show()
        }

        // Handle PDFs
        if (/\.pdf$/i.test(filePath)) {
          log.info(`[DropZone] Analyzing PDF: ${filePath}`)
          const buffer = await fs.promises.readFile(filePath)

          // pdf-parse v2 check
          const PDFParseClass =
            pdfLib.PDFParse || (pdfLib as any).default?.PDFParse || (pdfLib as any).default

          if (!PDFParseClass || typeof PDFParseClass !== 'function' || !PDFParseClass.prototype) {
            log.error('PDFParse class not found in export:', pdfLib)
            throw new Error('PDFParse class failed to load')
          }

          // Instantiate Parser
          const parser = new PDFParseClass({ data: buffer })
          const data = await parser.getText()
          const text = data.text

          if (text && text.trim().length > 0) {
            await indexDocument(filePath, text)
            new Notification({
              title: 'DashArchive',
              body: 'PDF Indexed successfully.',
              silent: false
            }).show()
          }
        }

        // Handle Text Files
        if (/\.(txt|md|json|js|ts|tsx)$/i.test(filePath)) {
          log.info(`[DropZone] Analyzing Text: ${filePath}`)
          const text = await fs.promises.readFile(filePath, 'utf-8')
          if (text && text.trim().length > 0) {
            await indexDocument(filePath, text)
            new Notification({
              title: 'DashArchive',
              body: 'Text File Indexed successfully.',
              silent: false
            }).show()
          }
        }
      } // End of for loop
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

  // Helper to index documents
  // Helper to index documents
  async function indexDocument(filePath: string, content: string): Promise<void> {
    // Truncate if too long for embedding model (simple truncation)
    const truncatedContent = content.slice(0, 8000)

    const embedding = await aiService.generateEmbedding(truncatedContent)
    if (embedding.length > 0) {
      try {
        const stats = await fs.promises.stat(filePath)
        const name = filePath.split(/[/\\]/).pop() || 'unknown'

        // Upsert
        sqlite
          .prepare(
            `
                INSERT INTO files (id, path, name, size, category, embedding, last_scan, content)
                VALUES (?, ?, ?, ?, 'document', ?, CURRENT_TIMESTAMP, ?)
                ON CONFLICT(id) DO UPDATE SET 
                    embedding = excluded.embedding,
                    last_scan = CURRENT_TIMESTAMP,
                    content = excluded.content
              `
          )
          .run(
            filePath, // Using path as ID for simplicity
            filePath,
            name,
            stats.size,
            JSON.stringify(embedding),
            truncatedContent
          )
        log.info(
          `[DropZone] Indexed ${name} for semantic search. Content Length: ${truncatedContent.length}`
        )
      } catch (dbErr) {
        log.error('Failed to save embedding:', dbErr)
      }
    }
  }

  // Semantic Search IPC
  ipcMain.handle('SEARCH:SEMANTIC', async (_, query: string) => {
    try {
      log.info(`[Search] Semantic query: "${query}"`)
      const queryEmbedding = await aiService.generateEmbedding(query)
      if (queryEmbedding.length === 0) return []

      // Fetch all files with embeddings
      const files = sqlite
        .prepare('SELECT id, path, name, embedding, content FROM files WHERE embedding IS NOT NULL')
        .all()

      log.info(`[Search] Found ${files.length} files with embeddings in DB.`)

      if (files.length === 0) return []

      const results = files
        .map((file: any) => {
          try {
            const embedding = JSON.parse(file.embedding)
            const similarity = cosineSimilarity(queryEmbedding, embedding)
            // Debug log for each file score
            if (similarity > 0.0) {
              log.info(`[Search] File: ${file.name}, Score: ${similarity}`)
              const preview = file.content
                ? file.content.substring(0, 100).replace(/\n/g, ' ')
                : 'NULL_OR_UNDEFINED'
              log.info(`[Search] Content Preview: ${preview}`)
            }
            return { ...file, score: similarity }
          } catch (e) {
            // Ignore parsing errors for now
            if (process.env.NODE_ENV === 'development') console.error(e)
            return null
          }
        })
        .filter((f: any) => f !== null)

      const topResults = results.sort((a: any, b: any) => b.score - a.score).slice(0, 20)
      log.info(
        `[Search] Top results:`,
        topResults.map((f: any) => ({ name: f.name, score: f.score }))
      )

      return topResults
    } catch (error) {
      log.error('Semantic search failed:', error)
      return []
    }
  })

  ipcMain.handle('fs:read-files', async (_, paths: string[]) => {
    const results: { path: string; name: string; content: string }[] = []

    for (const filePath of paths) {
      try {
        const name = filePath.split(/[/\\]/).pop() || 'unknown'
        let content = ''

        if (/\.pdf$/i.test(filePath)) {
          const buffer = await fs.promises.readFile(filePath)
          const PDFParseClass =
            pdfLib.PDFParse || (pdfLib as any).default?.PDFParse || (pdfLib as any).default
          if (PDFParseClass) {
            const parser = new PDFParseClass({ data: buffer })
            const data = await parser.getText()
            content = data.text
          }
        } else if (/\.(txt|md|json|js|ts|tsx)$/i.test(filePath)) {
          content = await fs.promises.readFile(filePath, 'utf-8')
        }

        if (content) {
          results.push({ path: filePath, name, content })
        }
      } catch (error) {
        log.error(`Failed to read file ${filePath}:`, error)
      }
    }
    return results
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
