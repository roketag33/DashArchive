import { ipcMain } from 'electron'
import { db } from '../db/index'
import { documents } from '../db/schema'

export function registerDatabaseHandlers(): void {
  ipcMain.handle('db:get-documents', async () => {
    try {
      return await db.select().from(documents).all()
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      throw error
    }
  })

  ipcMain.handle(
    'db:add-document',
    async (_, doc: { name: string; path: string; content?: string }) => {
      try {
        const result = await db
          .insert(documents)
          .values({
            name: doc.name,
            path: doc.path,
            content: doc.content
          })
          .returning()
        return result[0]
      } catch (error) {
        console.error('Failed to add document:', error)
        throw error
      }
    }
  )
}
